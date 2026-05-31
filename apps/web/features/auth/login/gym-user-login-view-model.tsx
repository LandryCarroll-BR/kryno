export type FieldName = "email" | "password"

export interface LoginActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export const failureMessages = {
  invalidInput: "Check the highlighted fields and try again.",
  invalidCredentials: "That email and password combination did not work.",
  unverified: "Please verify your email before signing in.",
  unknown: "An unexpected error occurred. Please try again later.",
} as const
