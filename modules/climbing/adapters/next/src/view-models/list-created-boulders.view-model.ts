export type CreatedBoulderViewModel = {
  readonly id: string
  readonly name: string
  readonly grade: string
  readonly wallAngle: string
  readonly movementStyle: string
  readonly createdAt: string
  readonly updatedAt: string
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
