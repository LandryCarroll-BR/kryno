import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { ClimbingAttemptId } from "@climbing/application/models/climbing-attempt"
import { BoulderId } from "@climbing/application/models/boulder"
import { ClimberId } from "@climbing/application/models/climber"
import {
  ActiveClimbingSession,
  ClimbingSessionId,
} from "@climbing/application/models/climbing-session"
import { ClimbingSessionRepository } from "@climbing/application/repositories/climbing-session"

import { ClimbingSessionInMemoryRepository } from "./repositories/climbing-session-in-memory.repository"

describe("ClimbingSessionInMemoryRepository.findAllByClimberId", () => {
  it.effect(
    "returns completed and active sessions only for the requested climber",
    () =>
      Effect.gen(function* () {
        const repository = yield* ClimbingSessionRepository
        const climberId = ClimberId.make("climber-1")
        const otherClimberId = ClimberId.make("climber-2")
        const firstSession = ActiveClimbingSession.make({
          id: ClimbingSessionId.make("session-1"),
          climberId,
          attempts: [],
          startedAt: new Date("2026-01-01T09:00:00.000Z"),
        })
        const secondSession = ActiveClimbingSession.make({
          id: ClimbingSessionId.make("session-2"),
          climberId,
          attempts: [],
          startedAt: new Date("2026-01-02T09:00:00.000Z"),
        })
        const otherSession = ActiveClimbingSession.make({
          id: ClimbingSessionId.make("session-other"),
          climberId: otherClimberId,
          attempts: [],
          startedAt: new Date("2026-01-01T09:00:00.000Z"),
        })

        yield* repository.insertActive(firstSession)
        yield* repository.insertAttemptIntoActiveSession({
          id: ClimbingAttemptId.make("attempt-1"),
          climberId,
          boulderId: BoulderId.make("boulder-1"),
          outcome: "FELL",
          occurredAt: new Date("2026-01-01T10:00:00.000Z"),
        })
        yield* repository.endActiveByClimberId(
          climberId,
          new Date("2026-01-01T11:00:00.000Z")
        )
        yield* repository.insertActive(secondSession)
        yield* repository.insertActive(otherSession)

        const sessions = yield* repository.findAllByClimberId(climberId)

        expect(sessions.map((session) => session.id)).toEqual([
          "session-1",
          "session-2",
        ])
        expect(
          Predicate.isTagged(sessions[0], "CompletedClimbingSession")
        ).toBe(true)
        expect(sessions[0]?.attempts.map((attempt) => attempt.id)).toEqual([
          "attempt-1",
        ])
        expect(Predicate.isTagged(sessions[1], "ActiveClimbingSession")).toBe(
          true
        )
      }).pipe(Effect.provide(ClimbingSessionInMemoryRepository))
  )
})
