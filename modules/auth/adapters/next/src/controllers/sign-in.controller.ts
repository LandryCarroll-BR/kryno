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
      message: "email must be at most 254 characters",
    }),
    Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "email must be a valid email address",
    })
  )
)

const PasswordSchema = Schema.String.pipe(
  Schema.check(
    Schema.isLengthBetween(8, 128, {
      message: "password must be between 8 and 128 characters",
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
  redirectUrl,
}: {
  previousState: SignInViewModel
  formData: FormData
  redirectUrl?: string | undefined
}) {
  const auth = yield* Auth
  const signInPresenter = yield* SignInPresenter
  const cookies = yield* Headers.Cookies
  const headers = yield* Headers.Headers

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
        const from = headers.get("Referer")
          ? new URL(headers.get("Referer")!).pathname
          : undefined
        const parsedInput = yield* Schema.decodeUnknownEffect(
          SignInControllerInputSchema
        )({
          email: formData.get("email"),
          password: formData.get("password"),
          username: formData.get("username"),
          confirmPassword: formData.get("confirmPassword"),
        })

        const session = yield* auth.signIn({
          email: parsedInput.email,
          password: parsedInput.password,
        })

        cookies.set("authToken", session.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(
            session.lastVerifiedAt.getTime() + 7 * 24 * 60 * 60 * 1000
          ), // 7 days
        })

        if (redirectUrl) {
          return yield* Navigation.Redirect(redirectUrl)
        }

        if (from) {
          return yield* Navigation.Redirect(from)
        }

        return signInPresenter.presentSuccess(submittedState)
      },
      Effect.catchTags({
        SchemaError: (error) => {
          return Effect.succeed(
            signInPresenter.presentInputParseError(submittedState, error)
          )
        },
        UserEmailNotFoundError: (error) => {
          return Effect.succeed(
            signInPresenter.presentError(submittedState, error)
          )
        },
        UserPasswordInvalidError: (error) => {
          return Effect.succeed(
            signInPresenter.presentError(submittedState, error)
          )
        },
      })
    ),
  }
})

const getString = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === "string" ? value : ""
}
