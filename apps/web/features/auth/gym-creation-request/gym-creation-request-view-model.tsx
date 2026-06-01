type FieldName = "name"

export type GymCreationRequestErrorCode =
  | "invalid-name"
  | "session-invalid"
  | "unverified"

export const GymCreationRequestViewModel = {
  validate: (input: Record<FieldName, string>) => {
    const fieldErrors: Partial<Record<FieldName, string>> = {}

    if (!input.name) {
      fieldErrors.name = "Enter a gym name."
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
    if (form !== "gym-creation-request") {
      return undefined
    }

    if (error === "invalid-name") {
      return "Enter a gym name."
    }

    return undefined
  },
  failureMessages: {
    invalidName: "invalid-name",
    sessionInvalid: "session-invalid",
    unverified: "unverified",
  } satisfies Record<string, GymCreationRequestErrorCode>,
}
