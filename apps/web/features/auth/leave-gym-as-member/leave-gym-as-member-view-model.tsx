type FieldName = "gymId"

export type LeaveGymAsMemberErrorCode =
  | "invalid-gym-id"
  | "inactive-gym"
  | "affiliation-conflict"
  | "session-invalid"
  | "unverified"

export const LeaveGymAsMemberViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.gymId) {
      fieldErrors.gymId = "Enter a gym ID."
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
    if (form !== "leave-gym") {
      return undefined
    }

    if (error === "invalid-gym-id") {
      return "Enter a gym ID."
    }

    return undefined
  },
  failureMessages: {
    invalidGymId: "invalid-gym-id",
    inactiveGym: "inactive-gym",
    affiliationConflict: "affiliation-conflict",
    sessionInvalid: "session-invalid",
    unverified: "unverified",
  } satisfies Record<string, LeaveGymAsMemberErrorCode>,
}
