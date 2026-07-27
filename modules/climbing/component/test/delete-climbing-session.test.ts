import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { BoulderName } from "@climbing/application/models/boulder"
import { ClimbingSessionId } from "@climbing/application/models/climbing-session"

import { Climbing } from "../src/index"
import { ClimbingTestLayer } from "./index"

describe("Climbing.deleteClimbingSession", () => {
  it.effect("deletes a completed session and removes its attempts", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const boulder = yield* climbing.createBoulder({
        token: "valid-token",
        name: BoulderName.make("Past session boulder"),
        grade: "V3",
        color: "GRAY",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
      })

      yield* climbing.startClimbingSession({ token: "valid-token" })
      yield* climbing.logBoulderAttempt({
        token: "valid-token",
        boulderId: boulder.id,
        outcome: "FELL",
        moveTypes: [],
      })
      const ended = yield* climbing.endClimbingSession({
        token: "valid-token",
      })

      const deleted = yield* climbing.deleteClimbingSession({
        token: "valid-token",
        climbingSessionId: ended.id,
      })
      const [remaining] = yield* climbing.listCreatedBoulders({
        token: "valid-token",
      })

      expect(deleted).toEqual(ended)
      expect(remaining?.boulder).toEqual(boulder)
      expect(remaining?.sessions).toEqual([])
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("does not delete an active session", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const active = yield* climbing.startClimbingSession({
        token: "valid-token",
      })

      const error = yield* Effect.flip(
        climbing.deleteClimbingSession({
          token: "valid-token",
          climbingSessionId: active.id,
        })
      )

      expect(
        Predicate.isTagged(error, "ActiveClimbingSessionCannotBeDeletedError")
      ).toBe(true)
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("does not delete another climber's completed session", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      yield* climbing.startClimbingSession({ token: "valid-token" })
      const ownerSession = yield* climbing.endClimbingSession({
        token: "valid-token",
      })

      const error = yield* Effect.flip(
        climbing.deleteClimbingSession({
          token: "other-valid-token",
          climbingSessionId: ownerSession.id,
        })
      )

      expect(Predicate.isTagged(error, "PastClimbingSessionNotFoundError")).toBe(
        true
      )
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("fails when the session has already been deleted", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      yield* climbing.startClimbingSession({ token: "valid-token" })
      const ended = yield* climbing.endClimbingSession({
        token: "valid-token",
      })

      yield* climbing.deleteClimbingSession({
        token: "valid-token",
        climbingSessionId: ended.id,
      })
      const error = yield* Effect.flip(
        climbing.deleteClimbingSession({
          token: "valid-token",
          climbingSessionId: ended.id,
        })
      )

      expect(Predicate.isTagged(error, "PastClimbingSessionNotFoundError")).toBe(
        true
      )
    }).pipe(Effect.provide(ClimbingTestLayer))
  )

  it.effect("fails before deletion when authentication is invalid", () =>
    Effect.gen(function* () {
      const climbing = yield* Climbing
      const error = yield* Effect.flip(
        climbing.deleteClimbingSession({
          token: "invalid-token",
          climbingSessionId: ClimbingSessionId.make("climbing-session-1"),
        })
      )

      expect(Predicate.isTagged(error, "UnauthenticatedClimberError")).toBe(
        true
      )
    }).pipe(Effect.provide(ClimbingTestLayer))
  )
})
