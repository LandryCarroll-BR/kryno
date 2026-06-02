type FieldName = "gymId" | "email"

export type CreateStaffInvitationErrorCode =
  | "invalid-gym-id"
  | "invalid-email"
  | "owner-access-denied"
  | "inactive-gym"
  | "self-assignment"
  | "session-invalid"
  | "unverified"

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

export const CreateStaffInvitationViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.gymId) {
      fieldErrors.gymId = "Enter a gym ID."
    }

    if (!input.email || !isValidEmail(input.email)) {
      fieldErrors.email = "Enter a valid email address."
    }

    return fieldErrors
  },
  readFormString: (formData: FormData, name: FieldName) => {
    const value = formData.get(name)
    return typeof value === "string" ? value.trim() : ""
  },
  fieldError: (
    form: string | null,
    error: string | null
  ): string | undefined => {
    if (form !== "create-staff-invitation") {
      return undefined
    }

    if (error === "invalid-gym-id") {
      return "Enter a gym ID."
    }

    if (error === "invalid-email") {
      return "Enter a valid email address."
    }

    return undefined
  },
  failureMessages: {
    invalidGymId: "invalid-gym-id",
    invalidEmail: "invalid-email",
    ownerAccessDenied: "owner-access-denied",
    inactiveGym: "inactive-gym",
    selfAssignment: "self-assignment",
    sessionInvalid: "session-invalid",
    unverified: "unverified",
  } satisfies Record<string, CreateStaffInvitationErrorCode>,
}
