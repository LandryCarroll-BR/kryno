import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import {
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"

import { Climbing } from "../src/index"
import { ClimbingTestLayer } from "./index"

describe("Climbing gym integration", () => {
  it.effect("looks up requested boulders across creators", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const first = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("First"),
        grade: "V2",
        wallAngle: "SLAB",
        movementStyle: "TECHNICAL",
      })
      const second = yield* climbing.createBoulder({
        token: "other-valid-token",
        name: BoulderName.make("Second"),
        grade: "V5",
        wallAngle: "OVERHANG",
        movementStyle: "POWER",
      })

      const result = yield* climbing.getBouldersByIds({
        boulderIds: [
          second.id,
          BoulderId.make("missing-boulder"),
          first.id,
        ],
      })

      expect(result.map(({ id }) => id)).toEqual([first.id, second.id])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect(
    "records an existing boulder after trusted authorization without weakening saved-boulder logging",
    () =>
      Effect.gen(function* () {
        const climbing = yield* Climbing
        const boulder = yield* climbing.createBoulder({
          token: "other-valid-token",
          name: BoulderName.make("Gym problem"),
          grade: "V5",
          wallAngle: "OVERHANG",
          movementStyle: "POWER",
        })
        yield* climbing.startClimbingSession({ token: "valid-token" })

        const personalError = yield* Effect.flip(
          climbing.logBoulderAttempt({
            token: "valid-token",
            boulderId: boulder.id,
            outcome: "FELL",
          })
        )
        expect(
          Predicate.isTagged(personalError, "SavedBoulderNotFoundError")
        ).toBe(true)

        const attempt = yield* climbing.logExistingBoulderAttempt({
          token: "valid-token",
          boulderId: boulder.id,
          outcome: "TOPPED",
        })
        expect(attempt).toMatchObject({
          boulderId: boulder.id,
          ordinal: 1,
          outcome: "TOPPED",
        })
      }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("requires an existing boulder and active session", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const boulder = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Session test"),
        grade: "V1",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })

      const noSession = yield* Effect.flip(
        climbing.logExistingBoulderAttempt({
          token: "other-valid-token",
          boulderId: boulder.id,
          outcome: "FELL",
        })
      )
      expect(
        Predicate.isTagged(noSession, "NoActiveClimbingSessionError")
      ).toBe(true)

      const missing = yield* Effect.flip(
        climbing.logExistingBoulderAttempt({
          token: "valid-token",
          boulderId: BoulderId.make("missing-boulder"),
          outcome: "FELL",
        })
      )
      expect(Predicate.isTagged(missing, "BoulderNotFoundError")).toBe(true)
    }).pipe(Effect.provide(ClimbingTestLayer))
  )
})
