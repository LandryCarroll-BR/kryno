export type GymBoulderOptionViewModel = {
  readonly label: string
  readonly value: string
}

export type ManagedGymRouteViewModel = {
  readonly id: string
  readonly order: number
  readonly positionLabel: string | null
  readonly setOn: string
  readonly setterName: string | null
  readonly boulder:
    | {
        readonly id: string
        readonly label: string
        readonly available: boolean
      }
    | null
}

export type ManagedGymAreaViewModel = {
  readonly id: string
  readonly name: string
  readonly routes: readonly ManagedGymRouteViewModel[]
}

export type GetGymManagementViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly gym: {
      readonly label: string
      readonly value: {
        readonly id: string
        readonly name: string
      } | null
    }
    readonly areas: {
      readonly label: string
      readonly value: readonly ManagedGymAreaViewModel[]
    }
    readonly boulders: {
      readonly label: string
      readonly value: readonly GymBoulderOptionViewModel[]
    }
  }
  readonly errors: Record<
    keyof GetGymManagementViewModel["fields"],
    string
  >
}

export const getGymManagementInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gym: { label: "Gym", value: null },
    areas: { label: "Areas and routes", value: [] },
    boulders: { label: "Your boulders", value: [] },
  },
  errors: {
    gym: "",
    areas: "",
    boulders: "",
  },
} satisfies GetGymManagementViewModel
