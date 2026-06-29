import { Effect, Schema } from "effect"
import { SignOutInputSchema } from "@auth/application/use-cases/sign-out"
import { Auth } from "@auth/component"
import { Headers } from "@packages/effect-next"

import { SignOutPresenter } from "../presenters/sign-out.presenter"
import { type SignOutViewModel } from "../view-models/sign-out.view-model"

export const SignOutControllerInputSchema = SignOutInputSchema.annotate({
  identifier: "SignOutControllerInput",
})

export const SignOutController = Effect.fn("SignOutController.make")(function* ({
  previousState,
}: {
  previousState: SignOutViewModel
}) {
  const auth = yield* Auth
  const cookies = yield* Headers.Cookies
  const presenter = yield* SignOutPresenter

  const completeSignOut = Effect.fn("SignOutController.completeSignOut")(
    function* () {
      cookies.delete({ name: "authToken", path: "/" })
      return yield* presenter.presentSuccess(undefined)
    }
  )

  return {
    handle: Effect.fn("SignOutController.handle")(
      function* (_formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* completeSignOut()
        }

        const input = yield* Schema.decodeUnknownEffect(
          SignOutControllerInputSchema
        )(
          {
            token: authToken.value,
          },
          { errors: "all" }
        )

        yield* auth.signOut(input)

        return yield* completeSignOut()
      },
      Effect.catchTags({
        SchemaError: () => completeSignOut(),
        InvalidSessionSecretHashError: () => completeSignOut(),
        InvalidSessionTokenError: () => completeSignOut(),
        SessionNotFoundError: () => completeSignOut(),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
