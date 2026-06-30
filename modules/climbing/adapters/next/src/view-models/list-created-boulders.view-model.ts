export type CreatedBoulderViewModel = {
  readonly id: string
  readonly name: string
  readonly grade: string
  readonly wallAngle: string
  readonly movementStyle: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly attemptCount: number
  readonly sessions: readonly BoulderAttemptSessionViewModel[]
}

export type BoulderAttemptSessionViewModel = {
  readonly id: string
  readonly status: "active" | "completed"
  readonly label: "Current session" | "Completed session"
  readonly startedAt: string
  readonly endedAt: string | null
  readonly attempts: readonly BoulderAttemptViewModel[]
}

export type BoulderAttemptViewModel = {
  readonly id: string
  readonly ordinal: number
  readonly outcome: {
    readonly label: "Fell" | "Topped"
    readonly value: "FELL" | "TOPPED"
  }
  readonly occurredAt: string
}

export type ListCreatedBouldersViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly boulders: {
      readonly label: string
      readonly value: readonly CreatedBoulderViewModel[]
    }
  }
  readonly errors: Record<keyof ListCreatedBouldersViewModel["fields"], string>
}

export const listCreatedBouldersInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    boulders: {
      label: "Your boulders",
      value: [],
    },
  },
  errors: {
    boulders: "",
  },
} satisfies ListCreatedBouldersViewModel
