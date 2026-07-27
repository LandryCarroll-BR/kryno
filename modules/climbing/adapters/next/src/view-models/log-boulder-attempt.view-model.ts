export type LogBoulderAttemptViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly attemptId: FieldViewModel
    readonly boulderId: FieldViewModel
    readonly outcome: FieldViewModel
    readonly moveTypes: FieldViewModel
    readonly ordinal: FieldViewModel
    readonly video: FieldViewModel
  }
  readonly errors: Record<keyof LogBoulderAttemptViewModel["fields"], string>
}

export const outcomeOptions = [
  { label: "Fell", value: "FELL" },
  { label: "Topped", value: "TOPPED" },
] as const satisfies readonly FieldViewModel[]

export const attemptMoveTypeOptions = [
  { label: "Dyno", value: "DYNO" },
  { label: "Deadpoint", value: "DEADPOINT" },
  { label: "Heel hook", value: "HEEL_HOOK" },
  { label: "Toe hook", value: "TOE_HOOK" },
  { label: "Drop knee", value: "DROP_KNEE" },
  { label: "Flag", value: "FLAG" },
  { label: "Match", value: "MATCH" },
  { label: "Mantle", value: "MANTLE" },
  { label: "Smear", value: "SMEAR" },
  { label: "Campus", value: "CAMPUS" },
  { label: "Compression", value: "COMPRESSION" },
  { label: "Gaston", value: "GASTON" },
  { label: "Undercling", value: "UNDERCLING" },
  { label: "Sidepull", value: "SIDEPULL" },
  { label: "Crimp", value: "CRIMP" },
  { label: "Pinch", value: "PINCH" },
  { label: "Sloper", value: "SLOPER" },
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
    moveTypes: {
      label: "Move types",
      value: "",
    },
    ordinal: {
      label: "Attempt",
      value: "",
    },
    video: {
      label: "Video",
      value: "",
    },
  },
  errors: {
    attemptId: "",
    boulderId: "",
    outcome: "",
    moveTypes: "",
    ordinal: "",
    video: "",
  },
} satisfies LogBoulderAttemptViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
