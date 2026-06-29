import { Effect, Schema } from "effect"
import { Password } from "@auth/application/models/user"
import { SignUpInputSchema } from "@auth/application/use-cases/sign-up"
import { Auth } from "@auth/component"

import { SetAuthCookie } from "../factories/set-auth-cookie.factory"
import { SignUpPresenter } from "../presenters/sign-up.presenter"
import { type SignUpViewModel } from "../view-models/sign-up.view-model"

export const SignUpControllerInputSchema = Schema.Struct({
  ...SignUpInputSchema.fields,
  confirmPassword: Password,
}).pipe(
  Schema.check(
    Schema.makeFilter((input) =>
      input.password === input.confirmPassword
        ? undefined
        : {
            path: ["confirmPassword"],
            issue: "Passwords must match.",
          }
    )
  ),
  Schema.annotate({ identifier: "SignUpControllerInput" })
)

export const SignUpController = Effect.fn("SignUpController.make")(function* ({
  previousState,
}: {
  previousState: SignUpViewModel
}) {
  const auth = yield* Auth
  const presenter = yield* SignUpPresenter
  const setAuthCookie = yield* SetAuthCookie

  return {
    handle: Effect.fn("SignUpController.handle")(
      function* (formData: FormData) {
        const input = yield* Schema.decodeUnknownEffect(
          SignUpControllerInputSchema
        )(Object.fromEntries(formData), { errors: "all" })

        const success = yield* auth.signUp({
          email: input.email,
          password: input.password,
          username: input.username,
        })

        yield* setAuthCookie({ session: success })

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UsernameAlreadyExistsError: (error) =>
          presenter.presentUsernameAlreadyExists(previousState, error),
        UserEmailAlreadyExistsError: (error) =>
          presenter.presentEmailAlreadyExists(previousState, error),
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError(previousState))
    ),
  }
})
