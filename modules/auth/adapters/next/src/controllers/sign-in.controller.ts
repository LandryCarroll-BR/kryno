import { Effect, Schema } from "effect"
import { Headers, Navigation } from "@packages/effect-next"
import { Auth } from "@auth/component"

import {
  SignInPresenter,
  type SignInViewModel,
} from "../presenters/sign-in.presenter"

const EmailSchema = Schema.Trim.pipe(
  Schema.check(
    Schema.isMaxLength(254, {
      message: "Email must be at most 254 characters.",
    }),
    Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Email must be a valid email address.",
    })
  )
)

const PasswordSchema = Schema.String.pipe(
  Schema.check(
    Schema.isLengthBetween(8, 128, {
      message: "Password must be between 8 and 128 characters.",
    })
  )
)

export const SignInControllerInputSchema = Schema.Struct({
  email: EmailSchema,
  password: PasswordSchema,
}).annotate({ identifier: "SignInControllerInput" })

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
            username: formData.get("username"),
            confirmPassword: formData.get("confirmPassword"),
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
