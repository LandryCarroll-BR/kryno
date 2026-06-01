type FieldName = "token" | "newPassword"

export interface PasswordResetCompletionActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export const PasswordResetCompletionViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.token) {
      fieldErrors.token = "Enter your reset token."
    }

    if (!input.newPassword) {
      fieldErrors.newPassword = "Enter a new password."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  initialToken: (url: URL) => url.searchParams.get("token")?.trim() ?? "",
  toError: (
    formError: string,
    fieldErrors: PasswordResetCompletionActionData["fieldErrors"] = {}
  ): PasswordResetCompletionActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  failureMessages: {
    invalidInput: "Check the highlighted fields and try again.",
    invalidToken: "That reset token is invalid or expired.",
    expiredToken: "That reset token has expired. Request a new reset link.",
    usedToken: "That reset token has already been used.",
  } as const,
}
