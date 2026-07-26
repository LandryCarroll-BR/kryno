export type DeleteClimbingSessionViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly climbingSessionId: FieldViewModel
  }
  readonly errors: Record<
    keyof DeleteClimbingSessionViewModel["fields"],
    string
  >
}

export const deleteClimbingSessionInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    climbingSessionId: {
      label: "Climbing session ID",
      value: "",
    },
  },
  errors: {
    climbingSessionId: "",
  },
} satisfies DeleteClimbingSessionViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
