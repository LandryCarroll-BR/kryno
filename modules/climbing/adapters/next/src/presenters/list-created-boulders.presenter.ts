import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { ListCreatedBouldersOutput } from "@climbing/application/use-cases/list-created-boulders"
import type { SchemaError } from "effect/Schema"

import {
  listCreatedBouldersInitialViewModel,
  type ListCreatedBouldersViewModel,
} from "../view-models/list-created-boulders.view-model"

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
    presentSuccess: (boulders) =>
      Effect.succeed({
        ...listCreatedBouldersInitialViewModel,
        status: "success",
        message:
          boulders.length === 0
            ? "No boulders yet. Create one to climb later."
            : "",
        fields: {
          boulders: {
            ...listCreatedBouldersInitialViewModel.fields.boulders,
            value: boulders.map((boulder) => ({
              id: boulder.id,
              name: boulder.name,
              grade: boulder.grade,
              wallAngle: boulder.wallAngle,
              movementStyle: boulder.movementStyle,
              createdAt: boulder.createdAt.toISOString(),
              updatedAt: boulder.updatedAt.toISOString(),
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
