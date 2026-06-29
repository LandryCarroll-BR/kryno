export type GetCurrentClimbingSessionViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly sessionId: FieldViewModel
    readonly startedAt: FieldViewModel
  }
  readonly errors: Record<
    keyof GetCurrentClimbingSessionViewModel["fields"],
    string
  >
}

export const getCurrentClimbingSessionInitialViewModel = {
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
} satisfies GetCurrentClimbingSessionViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
