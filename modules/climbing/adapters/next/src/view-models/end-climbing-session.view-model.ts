export type EndClimbingSessionViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly sessionId: FieldViewModel
    readonly startedAt: FieldViewModel
    readonly endedAt: FieldViewModel
  }
  readonly errors: Record<
    keyof EndClimbingSessionViewModel["fields"],
    string
  >
}

export const endClimbingSessionInitialViewModel = {
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
    endedAt: {
      label: "Ended at",
      value: "",
    },
  },
  errors: {
    sessionId: "",
    startedAt: "",
    endedAt: "",
  },
} satisfies EndClimbingSessionViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
