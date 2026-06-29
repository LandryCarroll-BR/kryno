export type StartClimbingSessionViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly sessionId: FieldViewModel
    readonly startedAt: FieldViewModel
  }
  readonly errors: Record<
    keyof StartClimbingSessionViewModel["fields"],
    string
  >
}

export const startClimbingSessionInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    sessionId: {
      label: "Session ID",
      value: "",
    },
    startedAt: {
      label: "Started at",
      value: "",
    },
  },
  errors: {
    sessionId: "",
    startedAt: "",
  },
} satisfies StartClimbingSessionViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
