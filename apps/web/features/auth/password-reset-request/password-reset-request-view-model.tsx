type FieldName = "email"

export type PasswordResetRequestActionData =
  | {
      readonly status: "success"
      readonly message: string
    }
  | {
      readonly status: "error"
      readonly formError?: string
      readonly fieldErrors?: Partial<Record<FieldName, string>>
    }

export const PasswordResetRequestViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.email) {
      fieldErrors.email = "Enter your email."
    } else if (!input.email.includes("@")) {
      fieldErrors.email = "Enter a valid email."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  toError: (
    formError: string,
    fieldErrors: Partial<Record<FieldName, string>> = {}
  ): PasswordResetRequestActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  toSuccess: (): PasswordResetRequestActionData => ({
    status: "success",
    message:
      "If an account exists for that email, password reset instructions will be sent shortly.",
  }),
  failureMessages: {
    invalidInput: "Check the highlighted fields and try again.",
  } as const,
}
