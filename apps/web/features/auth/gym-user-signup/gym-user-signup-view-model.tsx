type FieldName = "email" | "password" | "displayName"

export interface SignupActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export const SignupActionViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.email) {
      fieldErrors.email = "Enter your email."
    } else if (!input.email.includes("@")) {
      fieldErrors.email = "Enter a valid email."
    }

    if (!input.password) {
      fieldErrors.password = "Enter a password."
    } else if (input.password.length < 8) {
      fieldErrors.password = "Use at least 8 characters."
    }

    if (!input.displayName) {
      fieldErrors.displayName = "Enter your display name."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  toError: (
    formError: string,
    fieldErrors: SignupActionData["fieldErrors"] = {}
  ): SignupActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  failureMessages: {
    emailReserved: "That email is already reserved. Try signing in instead.",
    invalidInput: "Check the highlighted fields and try again.",
  } as const,
}
