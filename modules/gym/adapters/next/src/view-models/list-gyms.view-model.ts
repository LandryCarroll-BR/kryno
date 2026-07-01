export type GymListItemViewModel = {
  readonly id: string
  readonly name: string
  readonly isMember: boolean
}

export type ListGymsViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly gyms: {
      readonly label: string
      readonly value: readonly GymListItemViewModel[]
    }
  }
  readonly errors: Record<keyof ListGymsViewModel["fields"], string>
}

export const listGymsInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gyms: {
      label: "Gyms",
      value: [],
    },
  },
  errors: {
    gyms: "",
  },
} satisfies ListGymsViewModel
