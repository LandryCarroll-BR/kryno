type FieldViewModel = {
  readonly label: string
  readonly value: string
}

export type LogGymRouteAttemptViewModel = {
  readonly status:
    | "idle"
    | "success"
    | "invalid"
    | "forbidden"
    | "not-found"
    | "error"
  readonly message: string
  readonly fields: {
    readonly gymId: FieldViewModel
    readonly routeId: FieldViewModel
    readonly attemptId: FieldViewModel
    readonly outcome: FieldViewModel
    readonly moveTypes: FieldViewModel
    readonly ordinal: FieldViewModel
    readonly video: FieldViewModel
  }
  readonly errors: Record<
    keyof LogGymRouteAttemptViewModel["fields"],
    string
  >
}

export const gymAttemptOutcomeOptions = [
  { label: "Fell", value: "FELL" },
  { label: "Topped", value: "TOPPED" },
] as const satisfies readonly FieldViewModel[]

export const gymAttemptMoveTypeOptions = [
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

export const logGymRouteAttemptInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    routeId: { label: "Route", value: "" },
    attemptId: { label: "Attempt ID", value: "" },
    outcome: { label: "Outcome", value: "" },
    moveTypes: { label: "Move types", value: "" },
    ordinal: { label: "Attempt", value: "" },
    video: { label: "Video", value: "" },
  },
  errors: {
    gymId: "",
    routeId: "",
    attemptId: "",
    outcome: "",
    moveTypes: "",
    ordinal: "",
    video: "",
  },
} satisfies LogGymRouteAttemptViewModel
