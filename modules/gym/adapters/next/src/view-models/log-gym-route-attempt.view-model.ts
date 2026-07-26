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
    readonly ordinal: FieldViewModel
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

export const logGymRouteAttemptInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    routeId: { label: "Route", value: "" },
    attemptId: { label: "Attempt ID", value: "" },
    outcome: { label: "Outcome", value: "" },
    ordinal: { label: "Attempt", value: "" },
  },
  errors: {
    gymId: "",
    routeId: "",
    attemptId: "",
    outcome: "",
    ordinal: "",
  },
} satisfies LogGymRouteAttemptViewModel
