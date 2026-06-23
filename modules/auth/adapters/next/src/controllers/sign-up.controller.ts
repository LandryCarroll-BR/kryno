import { Effect, Schema } from "effect"
import { Navigation } from "@packages/effect-next"
import { Password, SignUpInputSchema } from "@auth/application"
import { Auth } from "@auth/component"

import { SetAuthCookie } from "../factories/set-auth-cookie.factory"

import {
  SignUpPresenter,
  type SignUpViewModel,
} from "../presenters/sign-up.presenter"

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
  formData,
}: {
  previousState: SignUpViewModel
  formData: FormData
}) {
  const auth = yield* Auth
  const signUpPresenter = yield* SignUpPresenter
  const setAuthCookie = yield* SetAuthCookie

  const submittedState: SignUpViewModel = {
    ...previousState,
    fields: {
      username: { value: getString(formData, "username") },
      email: { value: getString(formData, "email") },
      password: { value: "" },
      confirmPassword: { value: "" },
    },
  }

  return {
    handle: Effect.fn("SignUpController.handle")(
      function* ({ redirectUrl }: { redirectUrl: string }) {
        const parsedInput = yield* Schema.decodeUnknownEffect(
          SignUpControllerInputSchema
        )(
          {
            email: formData.get("email"),
            password: formData.get("password"),
            username: formData.get("username"),
            confirmPassword: formData.get("confirmPassword"),
          },
          { errors: "all" }
        )

        const session = yield* auth.signUp({
          email: parsedInput.email,
          password: parsedInput.password,
          username: parsedInput.username,
        })

        yield* setAuthCookie({ session })

        return yield* Navigation.Redirect(redirectUrl)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          signUpPresenter.presentInputParseError(submittedState, error),

        UsernameAlreadyExistsError: () =>
          signUpPresenter.presentUsernameAlreadyExists(submittedState),

        UserEmailAlreadyExistsError: () =>
          signUpPresenter.presentEmailAlreadyExists(submittedState),
      })
    ),
  }
})

const getString = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === "string" ? value : ""
}
