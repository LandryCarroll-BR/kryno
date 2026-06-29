import { Effect, Option, Schema } from "effect"
import { GetCurrentUserInputSchema } from "@auth/application/use-cases/get-current-user"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"

import { GetCurrentUserPresenter } from "../presenters/get-current-user.presenter"

export const GetCurrentUserControllerInputSchema =
  GetCurrentUserInputSchema.annotate({
    identifier: "GetCurrentUserControllerInput",
  })

export const GetCurrentUserController = Effect.fn(
  "GetCurrentUserController.make"
)(function* ({ redirectUrl }: { redirectUrl: string }) {
  const auth = yield* Auth
  const cookies = yield* Headers.Cookies
  const presenter = yield* GetCurrentUserPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("GetCurrentUserController.handle")(function* () {
      const authToken = cookies.get("authToken")

      if (!authToken?.value) {
        return yield* redirectToSignIn
      }

      const result = yield* Effect.gen(function* () {
        const input = yield* Schema.decodeUnknownEffect(
          GetCurrentUserControllerInputSchema
        )(
          {
            token: authToken.value,
          },
          { errors: "all" }
        )

        const success = yield* auth.getCurrentUser(input)

        return { _tag: "Success" as const, success }
      }).pipe(
        Effect.catchDefect(() =>
          presenter
            .presentUnexpectedError()
            .pipe(
              Effect.map((viewModel) => ({
                _tag: "Presented" as const,
                viewModel,
              }))
            )
        ),
        Effect.catchTags({
          SchemaError: () => redirectToSignIn,
          InvalidSessionSecretHashError: () => redirectToSignIn,
          InvalidSessionTokenError: () => redirectToSignIn,
          SessionNotFoundError: () => redirectToSignIn,
        })
      )

      if (result._tag === "Presented") {
        return result.viewModel
      }

      if (Option.isNone(result.success)) {
        return yield* redirectToSignIn
      }

      return yield* presenter.presentSuccess(result.success)
    }),
  }
})
