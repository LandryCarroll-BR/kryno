import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { ListGymsOutput } from "@gym/application/use-cases/list-gyms"
import type { SchemaError } from "effect/Schema"

import {
  listGymsInitialViewModel,
  type ListGymsViewModel,
} from "../view-models/list-gyms.view-model"

export class ListGymsPresenter extends Service<
  ListGymsPresenter,
  {
    readonly presentSuccess: (
      success: ListGymsOutput
    ) => Effect.Effect<ListGymsViewModel>
    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<ListGymsViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<ListGymsViewModel>
  }
>()("@gym/adapters/next/ListGymsPresenter") {
  static Live = Layer.succeed(ListGymsPresenter, {
    presentSuccess: (gyms) =>
      Effect.succeed({
        ...listGymsInitialViewModel,
        status: "success",
        message:
          gyms.length === 0
            ? "No gyms have been created yet."
            : "",
        fields: {
          gyms: {
            ...listGymsInitialViewModel.fields.gyms,
            value: gyms.map(({ gym, isMember }) => ({
              id: gym.id,
              name: gym.name,
              isMember,
            })),
          },
        },
      }),

    presentSchemaError: (_error) =>
      Effect.succeed({
        ...listGymsInitialViewModel,
        status: "invalid",
        message: "Unable to identify your session. Please sign in again.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        ...listGymsInitialViewModel,
        status: "error",
        message: "Unable to load gyms. Please try again.",
      }),
  })
}
