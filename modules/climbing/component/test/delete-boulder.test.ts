import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { BoulderId, BoulderName } from "@climbing/application/models/boulder"

import { Climbing } from "../src/index"
import { ClimbingTestLayer } from "./index"

describe("Climbing.deleteBoulder", () => {
  it.effect("deletes an authenticated climber's boulder", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const created = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Test boulder"),
        grade: "V3",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })

      const deleted = yield* climbing.deleteBoulder({
        token: "valid-token",
        boulderId: created.id,
      })
      const remaining = yield* climbing.listCreatedBoulders({
        token: "valid-token",
      })

      expect(deleted).toEqual(created)
      expect(remaining).toEqual([])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("fails when the boulder has already been deleted", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const created = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Test boulder"),
        grade: "V3",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })

      yield* climbing.deleteBoulder({
        token: "valid-token",
        boulderId: created.id,
      })
      const error = yield* Effect.flip(
        climbing.deleteBoulder({
          token: "valid-token",
          boulderId: created.id,
        })
      )

      expect(Predicate.isTagged(error, "CreatedBoulderNotFoundError")).toBe(true)
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("does not delete a boulder created by another climber", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const created = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Test boulder"),
        grade: "V3",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })

      const error = yield* Effect.flip(
        climbing.deleteBoulder({
          token: "other-valid-token",
          boulderId: created.id,
        })
      )
      const ownerBoulders = yield* climbing.listCreatedBoulders({
        token: "valid-token",
      })

      expect(
        Predicate.isTagged(error, "UnauthorizedToDeleteBoulderError")
      ).toBe(true)
      expect(ownerBoulders).toEqual([{ boulder: created, sessions: [] }])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("fails before deletion when authentication is invalid", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const error = yield* Effect.flip(
        climbing.deleteBoulder({
          token: "invalid-token",
          boulderId: BoulderId.make("boulder-1"),
        })
      )

      expect(Predicate.isTagged(error, "UnauthenticatedClimberError")).toBe(
        true
      )
    }).pipe(Effect.provide(ClimbingTestLayer))
  )
})
