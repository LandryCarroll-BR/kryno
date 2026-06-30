import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import {
  AttemptOrdinal,
  ClimbingAttempt,
  ClimbingAttemptId,
} from "@climbing/application/models/climbing-attempt"
import {
  Boulder,
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"
import { ClimberId } from "@climbing/application/models/climber"
import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
import type { ListCreatedBouldersOutput } from "@climbing/application/use-cases/list-created-boulders"

import { ListCreatedBouldersPresenter } from "../src/presenters/list-created-boulders.presenter"

describe("ListCreatedBouldersPresenter", () => {
  it.effect(
    "presents newest attempt history first with serializable values",
    () =>
      Effect.gen(function* () {
        const presenter = yield* ListCreatedBouldersPresenter
        const boulderId = BoulderId.make("boulder-1")
        const boulder = Boulder.make({
          id: boulderId,
          creatorClimberId: ClimberId.make("climber-1"),
          name: BoulderName.make("The Crux"),
          grade: "V5",
          wallAngle: "OVERHANG",
          movementStyle: "POWER",
          createdAt: new Date("2026-01-01T08:00:00.000Z"),
          updatedAt: new Date("2026-01-02T08:00:00.000Z"),
        })
        const output = [
          {
            boulder,
            sessions: [
              {
                id: ClimbingSessionId.make("session-older"),
                startedAt: new Date("2026-01-01T09:00:00.000Z"),
                endedAt: Option.some(new Date("2026-01-01T12:00:00.000Z")),
                attempts: [
                  ClimbingAttempt.make({
                    id: ClimbingAttemptId.make("attempt-1"),
                    boulderId,
                    ordinal: AttemptOrdinal.make(1),
                    outcome: "FELL",
                    occurredAt: new Date("2026-01-01T10:00:00.000Z"),
                  }),
                  ClimbingAttempt.make({
                    id: ClimbingAttemptId.make("attempt-2"),
                    boulderId,
                    ordinal: AttemptOrdinal.make(2),
                    outcome: "TOPPED",
                    occurredAt: new Date("2026-01-01T11:00:00.000Z"),
                  }),
                ],
              },
              {
                id: ClimbingSessionId.make("session-current"),
                startedAt: new Date("2026-01-02T09:00:00.000Z"),
                endedAt: Option.none(),
                attempts: [
                  ClimbingAttempt.make({
                    id: ClimbingAttemptId.make("attempt-3"),
                    boulderId,
                    ordinal: AttemptOrdinal.make(1),
                    outcome: "FELL",
                    occurredAt: new Date("2026-01-02T10:00:00.000Z"),
                  }),
                ],
              },
            ],
          },
        ] satisfies ListCreatedBouldersOutput

        const viewModel = yield* presenter.presentSuccess(output)
        const presented = viewModel.fields.boulders.value[0]

        expect(presented?.attemptCount).toBe(3)
        expect(presented?.sessions.map((session) => session.id)).toEqual([
          "session-current",
          "session-older",
        ])
        expect(presented?.sessions[0]?.status).toBe("active")
        expect(presented?.sessions[0]?.label).toBe("Current session")
        expect(presented?.sessions[0]?.endedAt).toBeNull()
        expect(
          presented?.sessions[1]?.attempts.map((attempt) => attempt.ordinal)
        ).toEqual([2, 1])
        expect(presented?.sessions[1]?.attempts[0]?.outcome).toEqual({
          label: "Topped",
          value: "TOPPED",
        })
      }).pipe(Effect.provide(ListCreatedBouldersPresenter.Live))
  )

  it.effect("presents an empty attempt history", () =>
    Effect.gen(function* () {
      const presenter = yield* ListCreatedBouldersPresenter
      const boulder = Boulder.make({
        id: BoulderId.make("boulder-1"),
        creatorClimberId: ClimberId.make("climber-1"),
        name: BoulderName.make("Fresh boulder"),
        grade: "V1",
        wallAngle: "SLAB",
        movementStyle: "TECHNICAL",
        createdAt: new Date("2026-01-01T08:00:00.000Z"),
        updatedAt: new Date("2026-01-01T08:00:00.000Z"),
      })

      const viewModel = yield* presenter.presentSuccess([
        { boulder, sessions: [] },
      ])
      const presented = viewModel.fields.boulders.value[0]

      expect(presented?.attemptCount).toBe(0)
      expect(presented?.sessions).toEqual([])
    }).pipe(Effect.provide(ListCreatedBouldersPresenter.Live))
  )
})
