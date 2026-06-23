import { describe, expect, it } from "@effect/vitest"
import {
  ActiveClimbingSession,
  ClimberId,
  ClimbingSessionId,
  ClimbingSessionRepository,
} from "@climbing/application"
import { Effect, Option } from "effect"

import { ClimbingSessionInMemoryRepository } from "./repositories/climbing-session-in-memory.repository"

describe("ClimbingSessionInMemoryRepository", () => {
  it.effect("returns one active session for concurrent creates", () =>
    Effect.gen(function* () {
      const repository = yield* ClimbingSessionRepository
      const climberId = ClimberId.make("climber-1")
      const startedAt = new Date("2026-06-23T12:00:00.000Z")

      const insertions = yield* Effect.all(
        [
          ClimbingSessionId.make("climbing-session-1"),
          ClimbingSessionId.make("climbing-session-2"),
        ].map((id) =>
          repository.insertActive(
            ActiveClimbingSession.make({
              id,
              climberId,
              attempts: [],
              startedAt,
            })
          )
        ),
        { concurrency: "unbounded" }
      )

      expect(insertions.filter(Option.isSome)).toHaveLength(1)
      expect(insertions.filter(Option.isNone)).toHaveLength(1)
    }).pipe(Effect.provide(ClimbingSessionInMemoryRepository))
  )
})
