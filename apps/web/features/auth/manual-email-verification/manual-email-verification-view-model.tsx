type FieldName = "token"

export interface ManualEmailVerificationActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export const ManualEmailVerificationActionViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.token) {
      fieldErrors.token = "Enter your verification token."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  toError: (
    formError: string,
    fieldErrors: ManualEmailVerificationActionData["fieldErrors"] = {}
  ): ManualEmailVerificationActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  failureMessages: {
    invalidInput: "Check the highlighted fields and try again.",
    invalidToken: "That verification token is invalid or expired.",
  } as const,
}
