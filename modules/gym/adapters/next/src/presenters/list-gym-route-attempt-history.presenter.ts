import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { ListGymRouteAttemptHistoryOutput } from "@gym/application/use-cases/list-gym-route-attempt-history"

import {
  listGymRouteAttemptHistoryInitialViewModel,
  type ListGymRouteAttemptHistoryViewModel,
} from "../view-models/list-gym-route-attempt-history.view-model"

export class ListGymRouteAttemptHistoryPresenter extends Service<
  ListGymRouteAttemptHistoryPresenter,
  {
    readonly presentSuccess: (
      success: ListGymRouteAttemptHistoryOutput
    ) => Effect.Effect<ListGymRouteAttemptHistoryViewModel>
    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<ListGymRouteAttemptHistoryViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<ListGymRouteAttemptHistoryViewModel>
  }
>()("@gym/adapters/next/ListGymRouteAttemptHistoryPresenter") {
  static Live = Layer.succeed(ListGymRouteAttemptHistoryPresenter, {
    presentSuccess: ({ gym, isMember, areas }) =>
      Effect.succeed({
        ...listGymRouteAttemptHistoryInitialViewModel,
        status: "success",
        message: !isMember
          ? `Join ${gym.name} to see and log its current boulders.`
          : areas.length === 0
            ? "This gym has not published any areas yet."
            : "",
        fields: {
          gym: {
            ...listGymRouteAttemptHistoryInitialViewModel.fields.gym,
            value: { id: gym.id, name: gym.name, isMember },
          },
          areas: {
            ...listGymRouteAttemptHistoryInitialViewModel.fields.areas,
            value: areas.map(({ area, routes }) => ({
              id: area.id,
              name: area.name,
              routes: routes.map(({ route, boulder, attempts }) => ({
                id: route.id,
                order: route.order,
                positionLabel: Option.getOrNull(route.positionLabel),
                setOn: route.setOn,
                setterName: Option.getOrNull(route.setterName),
                imageUrl: Option.getOrNull(route.imageUrl),
                boulder: Option.match(boulder, {
                  onNone: () => ({
                    id: route.boulderId,
                    name: "Unavailable boulder",
                    grade: "",
                    color: "UNSPECIFIED",
                    wallAngle: "",
                    movementStyle: "",
                    available: false,
                  }),
                  onSome: ({
                    id,
                    name,
                    grade,
                    color,
                    wallAngle,
                    movementStyle,
                  }) => ({
                    id,
                    name,
                    grade,
                    color,
                    wallAngle,
                    movementStyle,
                    available: true,
                  }),
                }),
                attemptCount: attempts.length,
                attempts: [...attempts]
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
                    occurredAt: attempt.occurredAt.toISOString(),
                  })),
              })),
            })),
          },
        },
      }),
    presentSchemaError: (_error) =>
      Effect.succeed({
        ...listGymRouteAttemptHistoryInitialViewModel,
        status: "invalid",
        message: "Unable to identify this gym.",
      }),
    presentUnexpectedError: () =>
      Effect.succeed({
        ...listGymRouteAttemptHistoryInitialViewModel,
        status: "error",
        message: "Unable to load this gym. Please try again.",
      }),
  })
}
