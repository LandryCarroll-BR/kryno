export type LogBoulderAttemptViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly attemptId: FieldViewModel
    readonly boulderId: FieldViewModel
    readonly outcome: FieldViewModel
    readonly ordinal: FieldViewModel
  }
  readonly errors: Record<keyof LogBoulderAttemptViewModel["fields"], string>
}

export const outcomeOptions = [
  { label: "Fell", value: "FELL" },
  { label: "Topped", value: "TOPPED" },
] as const satisfies readonly FieldViewModel[]

export const logBoulderAttemptInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    attemptId: {
      label: "Attempt ID",
      value: "",
    },
    boulderId: {
      label: "Boulder ID",
      value: "",
    },
    outcome: {
      label: "Outcome",
      value: "",
    },
    ordinal: {
      label: "Attempt",
      value: "",
    },
  },
  errors: {
    attemptId: "",
    boulderId: "",
    outcome: "",
    ordinal: "",
  },
} satisfies LogBoulderAttemptViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
