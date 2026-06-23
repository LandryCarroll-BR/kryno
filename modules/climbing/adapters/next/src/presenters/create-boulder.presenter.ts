import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { Boulder } from "@climbing/application"

export type CreateBoulderViewModel =
  | {
      readonly status: "idle"
    }
  | {
      readonly status: "success"
      readonly boulderId: string
      readonly name: string
      readonly grade: string
    }
  | {
      readonly status: "error"
      readonly error: string
    }

export class CreateBoulderPresenter extends Service<
  CreateBoulderPresenter,
  {
    readonly presentSuccess: (
      boulder: Boulder
    ) => Effect.Effect<CreateBoulderViewModel>
    readonly presentValidationError: () => Effect.Effect<CreateBoulderViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<CreateBoulderViewModel>
  }
>()("@climbing/adapters/next/CreateBoulderPresenter") {
  static Live = Layer.succeed(CreateBoulderPresenter, {
    presentSuccess: (boulder) =>
      Effect.succeed({
        status: "success",
        boulderId: boulder.id,
        name: boulder.name,
        grade: boulder.grade,
      }),

    presentValidationError: () =>
      Effect.succeed({
        status: "error",
        error: "Enter a boulder name, grade, wall angle, and movement style.",
      }),

    presentUnexpectedError: () =>
      Effect.succeed({
        status: "error",
        error: "Unable to create this boulder. Please try again.",
      }),
  })
}
