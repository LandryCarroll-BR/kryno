import { Effect, Schema } from "effect"
import { Navigation } from "@packages/effect-next"
import { SignInInputSchema } from "@auth/application"
import { Auth } from "@auth/component"

import { SetAuthCookie } from "../factories/set-auth-cookie.factory"

import {
  SignInPresenter,
  type SignInViewModel,
} from "../presenters/sign-in.presenter"

export const SignInControllerInputSchema = SignInInputSchema.annotate({
  identifier: "SignInControllerInput",
})

export const SignInController = Effect.fn("SignInController.make")(function* ({
  previousState,
  formData,
}: {
  previousState: SignInViewModel
  formData: FormData
}) {
  const auth = yield* Auth
  const signInPresenter = yield* SignInPresenter
  const setAuthCookie = yield* SetAuthCookie

  const submittedState: SignInViewModel = {
    ...previousState,
    fields: {
      email: { value: getString(formData, "email") },
      password: { value: "" },
    },
  }

  return {
    handle: Effect.fn("SignInController.handle")(
      function* ({ redirectUrl }: { redirectUrl: string }) {
        const parsedInput = yield* Schema.decodeUnknownEffect(
          SignInControllerInputSchema
        )(
          {
            email: formData.get("email"),
            password: formData.get("password"),
          },
          { errors: "all" }
        )

        const session = yield* auth.signIn({
          email: parsedInput.email,
          password: parsedInput.password,
        })

        yield* setAuthCookie({ session })

        return yield* Navigation.Redirect(redirectUrl)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          signInPresenter.presentInputParseError(submittedState, error),
        UserEmailNotFoundError: () =>
          signInPresenter.presentEmailNotFound(submittedState),
        UserPasswordInvalidError: () =>
          signInPresenter.presentPasswordInvalid(submittedState),
      })
    ),
  }
})

const getString = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === "string" ? value : ""
}
