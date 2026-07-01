export type JoinGymViewModel = {
  readonly status:
    | "idle"
    | "success"
    | "invalid"
    | "not-found"
    | "already-member"
    | "error"
  readonly message: string
  readonly fields: {
    readonly gymId: {
      readonly label: string
      readonly value: string
    }
  }
  readonly errors: Record<keyof JoinGymViewModel["fields"], string>
}

export const joinGymInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: {
      label: "Gym",
      value: "",
    },
  },
  errors: {
    gymId: "",
  },
} satisfies JoinGymViewModel
