import { Effect, Schema } from "effect"
import { Headers, Navigation } from "@packages/effect-next"
import { SignInInputSchema } from "@auth/application"
import { Auth } from "@auth/component"

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
  const cookies = yield* Headers.Cookies

  const submittedState: SignInViewModel = {
    ...previousState,
    fields: {
      email: { value: getString(formData, "email") },
      password: { value: "" },
    },
  }

  return {
    handle: Effect.fn("SignInController.handle")(
      function* () {
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

        cookies.set("authToken", session.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        })

        return yield* Navigation.Redirect("/dashboard")
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
