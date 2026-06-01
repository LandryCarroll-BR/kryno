type FieldName = "email" | "password"

export interface LoginActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export interface LoginStatusMessage {
  readonly variant: "success"
  readonly message: string
}

export const LoginActionViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.email) {
      fieldErrors.email = "Enter your email."
    } else if (!input.email.includes("@")) {
      fieldErrors.email = "Enter a valid email."
    }

    if (!input.password) {
      fieldErrors.password = "Enter your password."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  toError: (
    formError: string,
    fieldErrors: LoginActionData["fieldErrors"] = {}
  ): LoginActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  statusMessage: (status: string | null): LoginStatusMessage | undefined => {
    if (status === "password-reset-complete") {
      return {
        variant: "success",
        message: "Your password has been reset. Sign in with your new password.",
      }
    }

    return undefined
  },
  failureMessages: {
    invalidInput: "Check the highlighted fields and try again.",
    invalidCredentials: "That email and password combination did not work.",
    unverified: "Please verify your email before signing in.",
    unknown: "An unexpected error occurred. Please try again later.",
  } as const,
}
