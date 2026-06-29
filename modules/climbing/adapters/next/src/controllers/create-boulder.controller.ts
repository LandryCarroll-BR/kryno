import { Effect, Schema } from "effect"
import { CreateBoulderInputSchema } from "@climbing/application"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateBoulderPresenter } from "../presenters/create-boulder.presenter"
import { type CreateBoulderViewModel } from "../view-models/create-boulder.view-model"

export const CreateBoulderController = Effect.fn(
  "CreateBoulderController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: CreateBoulderViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* CreateBoulderPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("CreateBoulderController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          CreateBoulderInputSchema
        )(
          {
            token: authToken.value,
            ...Object.fromEntries(formData),
          },
          { errors: "all" }
        )

        const success = yield* climbing.createBoulder(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedClimberError: () => redirectToSignIn,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
