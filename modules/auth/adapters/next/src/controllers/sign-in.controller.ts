import { Effect, Schema } from "effect"
import { SignInInputSchema } from "@auth/application/use-cases/sign-in"
import { Auth } from "@auth/component"

import { SetAuthCookie } from "../factories/set-auth-cookie.factory"
import { SignInPresenter } from "../presenters/sign-in.presenter"
import { type SignInViewModel } from "../view-models/sign-in.view-model"

export const SignInControllerInputSchema = SignInInputSchema.annotate({
  identifier: "SignInControllerInput",
})

export const SignInController = Effect.fn("SignInController.make")(function* ({
  previousState,
}: {
  previousState: SignInViewModel
}) {
  const auth = yield* Auth
  const presenter = yield* SignInPresenter
  const setAuthCookie = yield* SetAuthCookie

  return {
    handle: Effect.fn("SignInController.handle")(
      function* (formData: FormData) {
        const input = yield* Schema.decodeUnknownEffect(
          SignInControllerInputSchema
        )(Object.fromEntries(formData), { errors: "all" })

        const success = yield* auth.signIn(input)

        yield* setAuthCookie({ session: success })

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UserEmailNotFoundError: (error) =>
          presenter.presentEmailNotFound(previousState, error),
        UserPasswordInvalidError: (error) =>
          presenter.presentPasswordInvalid(previousState, error),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
