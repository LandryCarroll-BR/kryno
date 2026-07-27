export type GymRouteAttemptViewModel = {
  readonly id: string
  readonly ordinal: number
  readonly outcome: {
    readonly label: "Fell" | "Topped"
    readonly value: "FELL" | "TOPPED"
  }
  readonly occurredAt: string
}

export type GymRouteAttemptBoulderViewModel = {
  readonly id: string
  readonly name: string
  readonly grade: string
  readonly color: string
  readonly wallAngle: string
  readonly movementStyle: string
  readonly available: boolean
}

export type GymRouteAttemptHistoryRouteViewModel = {
  readonly id: string
  readonly order: number
  readonly positionLabel: string | null
  readonly setOn: string
  readonly setterName: string | null
  readonly imageUrl: string | null
  readonly boulder: GymRouteAttemptBoulderViewModel
  readonly attemptCount: number
  readonly attempts: readonly GymRouteAttemptViewModel[]
}

export type GymRouteAttemptHistoryAreaViewModel = {
  readonly id: string
  readonly name: string
  readonly routes: readonly GymRouteAttemptHistoryRouteViewModel[]
}

export type ListGymRouteAttemptHistoryViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly gym: {
      readonly label: string
      readonly value: {
        readonly id: string
        readonly name: string
        readonly isMember: boolean
      } | null
    }
    readonly areas: {
      readonly label: string
      readonly value: readonly GymRouteAttemptHistoryAreaViewModel[]
    }
  }
  readonly errors: Record<
    keyof ListGymRouteAttemptHistoryViewModel["fields"],
    string
  >
}

export const listGymRouteAttemptHistoryInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gym: { label: "Gym", value: null },
    areas: { label: "Areas, routes, and attempts", value: [] },
  },
  errors: {
    gym: "",
    areas: "",
  },
} satisfies ListGymRouteAttemptHistoryViewModel
