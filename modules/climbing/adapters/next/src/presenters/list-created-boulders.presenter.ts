import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { ListCreatedBouldersOutput } from "@climbing/application/use-cases/list-created-boulders"
import type { SchemaError } from "effect/Schema"

import {
  listCreatedBouldersInitialViewModel,
  type BoulderAttemptMoveTypeViewModel,
  type ListCreatedBouldersViewModel,
} from "../view-models/list-created-boulders.view-model"

const moveTypeLabels = {
  DYNO: "Dyno",
  DEADPOINT: "Deadpoint",
  HEEL_HOOK: "Heel hook",
  TOE_HOOK: "Toe hook",
  DROP_KNEE: "Drop knee",
  FLAG: "Flag",
  MATCH: "Match",
  MANTLE: "Mantle",
  SMEAR: "Smear",
  CAMPUS: "Campus",
  COMPRESSION: "Compression",
  GASTON: "Gaston",
  UNDERCLING: "Undercling",
  SIDEPULL: "Sidepull",
  CRIMP: "Crimp",
  PINCH: "Pinch",
  SLOPER: "Sloper",
} as const satisfies Record<BoulderAttemptMoveTypeViewModel["value"], string>

export class ListCreatedBouldersPresenter extends Service<
  ListCreatedBouldersPresenter,
  {
    readonly presentSuccess: (
      success: ListCreatedBouldersOutput
    ) => Effect.Effect<ListCreatedBouldersViewModel>

    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<ListCreatedBouldersViewModel>

    readonly presentUnexpectedError: () => Effect.Effect<ListCreatedBouldersViewModel>
  }
>()("@climbing/adapters/next/ListCreatedBouldersPresenter") {
  static Live = Layer.succeed(ListCreatedBouldersPresenter, {
    presentSuccess: (bouldersWithHistory) =>
      Effect.succeed({
        ...listCreatedBouldersInitialViewModel,
        status: "success",
        message:
          bouldersWithHistory.length === 0
            ? "No boulders yet. Create one to climb later."
            : "",
        fields: {
          boulders: {
            ...listCreatedBouldersInitialViewModel.fields.boulders,
            value: bouldersWithHistory.map(({ boulder, sessions }) => ({
              id: boulder.id,
              name: boulder.name,
              grade: boulder.grade,
              color: boulder.color,
              wallAngle: boulder.wallAngle,
              movementStyle: boulder.movementStyle,
              createdAt: boulder.createdAt.toISOString(),
              updatedAt: boulder.updatedAt.toISOString(),
              attemptCount: sessions.reduce(
                (count, session) => count + session.attempts.length,
                0
              ),
              sessions: [...sessions]
                .sort(
                  (left, right) =>
                    right.startedAt.getTime() - left.startedAt.getTime()
                )
                .map((session) => ({
                  id: session.id,
                  status: Option.isNone(session.endedAt)
                    ? ("active" as const)
                    : ("completed" as const),
                  label: Option.isNone(session.endedAt)
                    ? ("Current session" as const)
                    : ("Completed session" as const),
                  startedAt: session.startedAt.toISOString(),
                  endedAt:
                    Option.getOrNull(session.endedAt)?.toISOString() ?? null,
                  attempts: [...session.attempts]
                    .sort((left, right) => {
                      const occurredAt =
                        right.occurredAt.getTime() - left.occurredAt.getTime()

                      return occurredAt === 0
                        ? right.ordinal - left.ordinal
                        : occurredAt
                    })
                    .map((attempt) => ({
                      id: attempt.id,
                      ordinal: attempt.ordinal,
                      outcome: {
                        label:
                          attempt.outcome === "FELL"
                            ? ("Fell" as const)
                            : ("Topped" as const),
                        value: attempt.outcome,
                      },
                      moveTypes: attempt.moveTypes.map((moveType) => ({
                        label: moveTypeLabels[moveType],
                        value: moveType,
                      })),
                      occurredAt: attempt.occurredAt.toISOString(),
                    })),
                })),
            })),
          },
        },
      }),

    presentSchemaError: (_error) =>
      Effect.succeed({
        ...listCreatedBouldersInitialViewModel,
        status: "invalid",
        message: "Invalid input. Please check your data and try again.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        ...listCreatedBouldersInitialViewModel,
        status: "error",
        message: "Unable to load your boulders. Please try again.",
      }),
  })
}
