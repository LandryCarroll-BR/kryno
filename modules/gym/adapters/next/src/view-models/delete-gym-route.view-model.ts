export type DeleteGymRouteViewModel = {
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
  }
  readonly errors: Record<keyof DeleteGymRouteViewModel["fields"], string>
}

export const deleteGymRouteInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    routeId: { label: "Route", value: "" },
  },
  errors: {
    gymId: "",
    routeId: "",
  },
} satisfies DeleteGymRouteViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
