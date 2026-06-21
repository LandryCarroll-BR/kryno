import { Effect, Schema } from "effect"
import { Headers, Navigation } from "@packages/effect-next"
import { Auth } from "@auth/component"

import {
  SignUpPresenter,
  type SignUpViewModel,
} from "../presenters/sign-up.presenter"

const UsernameSchema = Schema.Trim.pipe(
  Schema.check(
    Schema.isLengthBetween(3, 32, {
      message: "username must be between 3 and 32 characters",
    }),
    Schema.isPattern(/^[a-zA-Z0-9_]+$/, {
      message: "username may only contain letters, numbers, and underscores",
    })
  )
)

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

export const SignUpControllerInputSchema = Schema.Struct({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: PasswordSchema,
}).pipe(
  Schema.check(
    Schema.makeFilter((input) =>
      input.password === input.confirmPassword
        ? undefined
        : {
            path: ["confirmPassword"],
            issue: "confirmPassword must match password",
          }
    )
  ),
  Schema.annotate({ identifier: "SignUpControllerInput" })
)

export const SignUpController = Effect.fn("SignUpController.make")(function* ({
  previousState,
  formData,
  redirectUrl,
}: {
  previousState: SignUpViewModel
  formData: FormData
  redirectUrl?: string | undefined
}) {
  const auth = yield* Auth
  const signUpPresenter = yield* SignUpPresenter
  const cookies = yield* Headers.Cookies
  const headers = yield* Headers.Headers

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
      function* () {
        const from = headers.get("Referer")
          ? new URL(headers.get("Referer")!).pathname
          : undefined
        const parsedInput = yield* Schema.decodeUnknownEffect(
          SignUpControllerInputSchema
        )({
          email: formData.get("email"),
          password: formData.get("password"),
          username: formData.get("username"),
          confirmPassword: formData.get("confirmPassword"),
        })

        const session = yield* auth.signUp({
          email: parsedInput.email,
          password: parsedInput.password,
          username: parsedInput.username,
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

        return yield* signUpPresenter.presentSuccess(submittedState)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          signUpPresenter.presentInputParseError(submittedState, error),

        UsernameAlreadyExistsError: (error) =>
          signUpPresenter.presentError(submittedState, error),

        UserEmailAlreadyExistsError: (error) =>
          signUpPresenter.presentError(submittedState, error),
      })
    ),
  }
})

const getString = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === "string" ? value : ""
}
