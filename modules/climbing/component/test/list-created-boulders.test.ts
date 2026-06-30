import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { TestClock } from "effect/testing"
import { BoulderName } from "@climbing/application/models/boulder"

import { Climbing } from "../src/index"
import { ClimbingTestLayer } from "./index"

describe("Climbing.listCreatedBoulders", () => {
  it.effect(
    "includes attempts from completed and active sessions for each boulder",
    () =>
      Effect.gen(function* () {
        const climbing = yield* Climbing
        const boulder = yield* climbing.createBoulder({
          token: "valid-token",
          name: BoulderName.make("History test"),
          grade: "V4",
          wallAngle: "OVERHANG",
          movementStyle: "POWER",
        })

        yield* climbing.startClimbingSession({ token: "valid-token" })
        yield* climbing.logBoulderAttempt({
          token: "valid-token",
          boulderId: boulder.id,
          outcome: "FELL",
        })
        yield* climbing.endClimbingSession({ token: "valid-token" })

        yield* TestClock.adjust("1 hour")
        yield* climbing.startClimbingSession({ token: "valid-token" })
        yield* climbing.logBoulderAttempt({
          token: "valid-token",
          boulderId: boulder.id,
          outcome: "TOPPED",
        })

        const [result] = yield* climbing.listCreatedBoulders({
          token: "valid-token",
        })

        expect(result?.boulder).toEqual(boulder)
        expect(result?.sessions).toHaveLength(2)
        expect(
          result?.sessions.flatMap((session) =>
            session.attempts.map((attempt) => attempt.outcome)
          )
        ).toEqual(["FELL", "TOPPED"])
        expect(Option.isSome(result?.sessions[0]?.endedAt)).toBe(true)
        expect(Option.isNone(result?.sessions[1]?.endedAt)).toBe(true)
      }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("keeps boulders with no attempts in the result", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const attemptedBoulder = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Attempted"),
        grade: "V4",
        wallAngle: "OVERHANG",
        movementStyle: "POWER",
      })
      const emptyBoulder = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Fresh"),
        grade: "V2",
        wallAngle: "SLAB",
        movementStyle: "TECHNICAL",
      })

      yield* climbing.startClimbingSession({ token: "valid-token" })
      yield* climbing.logBoulderAttempt({
        token: "valid-token",
        boulderId: attemptedBoulder.id,
        outcome: "FELL",
      })

      const result = yield* climbing.listCreatedBoulders({
        token: "valid-token",
      })
      const attempted = result.find(
        ({ boulder }) => boulder.id === attemptedBoulder.id
      )
      const empty = result.find(({ boulder }) => boulder.id === emptyBoulder.id)

      expect(attempted?.sessions).toHaveLength(1)
      expect(empty?.sessions).toEqual([])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("does not include another climber's attempt history", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const ownerBoulder = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Owner boulder"),
        grade: "V3",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })
      const otherBoulder = yield* climbing.createBoulder({
        token: "other-valid-token",
        name: BoulderName.make("Other boulder"),
        grade: "V6",
        wallAngle: "OVERHANG",
        movementStyle: "POWER",
      })

      yield* climbing.startClimbingSession({ token: "valid-token" })
      yield* climbing.logBoulderAttempt({
        token: "valid-token",
        boulderId: ownerBoulder.id,
        outcome: "FELL",
      })
      yield* climbing.startClimbingSession({ token: "other-valid-token" })
      yield* climbing.logBoulderAttempt({
        token: "other-valid-token",
        boulderId: otherBoulder.id,
        outcome: "TOPPED",
      })

      const result = yield* climbing.listCreatedBoulders({
        token: "valid-token",
      })

      expect(result.map(({ boulder }) => boulder.id)).toEqual([ownerBoulder.id])
      expect(
        result.flatMap(({ sessions }) =>
          sessions.flatMap(({ attempts }) =>
            attempts.map((attempt) => attempt.outcome)
          )
        )
      ).toEqual(["FELL"])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )
})
