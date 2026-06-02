type FieldName = "token"

export interface AcceptStaffInvitationActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

export const AcceptStaffInvitationViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.token) {
      fieldErrors.token = "Enter your invitation token."
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
    fieldErrors: AcceptStaffInvitationActionData["fieldErrors"] = {}
  ): AcceptStaffInvitationActionData => ({
    status: "error",
    formError,
    fieldErrors,
  }),
  failureMessages: {
    invalidInput: "Check the highlighted fields and try again.",
    invalidToken: "That staff invitation token is invalid or expired.",
    inactiveGym: "That gym is not active yet.",
    selfAssignment: "You cannot accept your own staff invitation.",
    unverified: "Please verify your email before accepting the invitation.",
  } as const,
}
