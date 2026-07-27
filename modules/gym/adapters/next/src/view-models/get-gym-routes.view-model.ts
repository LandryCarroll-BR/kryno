export type GymRouteBoulderViewModel = {
  readonly id: string
  readonly name: string
  readonly grade: string
  readonly color: string
  readonly wallAngle: string
  readonly movementStyle: string
  readonly available: boolean
}

export type MemberGymRouteViewModel = {
  readonly id: string
  readonly order: number
  readonly positionLabel: string | null
  readonly setOn: string
  readonly setterName: string | null
  readonly imageUrl: string | null
  readonly boulder: GymRouteBoulderViewModel
}

export type MemberGymAreaViewModel = {
  readonly id: string
  readonly name: string
  readonly routes: readonly MemberGymRouteViewModel[]
}

export type GetGymRoutesViewModel = {
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
      readonly value: readonly MemberGymAreaViewModel[]
    }
  }
  readonly errors: Record<keyof GetGymRoutesViewModel["fields"], string>
}

export const getGymRoutesInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gym: { label: "Gym", value: null },
    areas: { label: "Areas and routes", value: [] },
  },
  errors: {
    gym: "",
    areas: "",
  },
} satisfies GetGymRoutesViewModel
