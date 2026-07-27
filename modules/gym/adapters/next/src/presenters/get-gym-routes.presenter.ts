import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import type { GetGymRoutesOutput } from "@gym/application/use-cases/get-gym-routes"

import {
  getGymRoutesInitialViewModel,
  type GetGymRoutesViewModel,
} from "../view-models/get-gym-routes.view-model"

export class GetGymRoutesPresenter extends Service<
  GetGymRoutesPresenter,
  {
    readonly presentSuccess: (
      success: GetGymRoutesOutput
    ) => Effect.Effect<GetGymRoutesViewModel>
    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<GetGymRoutesViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<GetGymRoutesViewModel>
  }
>()("@gym/adapters/next/GetGymRoutesPresenter") {
  static Live = Layer.succeed(GetGymRoutesPresenter, {
    presentSuccess: ({ gym, isMember, areas }) =>
      Effect.succeed({
        ...getGymRoutesInitialViewModel,
        status: "success",
        message: !isMember
          ? `Join ${gym.name} to see and log its current boulders.`
          : areas.length === 0
            ? "This gym has not published any areas yet."
            : "",
        fields: {
          gym: {
            ...getGymRoutesInitialViewModel.fields.gym,
            value: { id: gym.id, name: gym.name, isMember },
          },
          areas: {
            ...getGymRoutesInitialViewModel.fields.areas,
            value: areas.map(({ area, routes }) => ({
              id: area.id,
              name: area.name,
              routes: routes.map(({ route, boulder }) => ({
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
              })),
            })),
          },
        },
      }),
    presentSchemaError: (_error) =>
      Effect.succeed({
        ...getGymRoutesInitialViewModel,
        status: "invalid",
        message: "Unable to identify this gym.",
      }),
    presentUnexpectedError: () =>
      Effect.succeed({
        ...getGymRoutesInitialViewModel,
        status: "error",
        message: "Unable to load this gym. Please try again.",
      }),
  })
}
