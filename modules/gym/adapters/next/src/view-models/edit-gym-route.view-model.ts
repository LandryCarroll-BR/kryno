export type EditGymRouteViewModel = {
  readonly status:
    | "idle"
    | "success"
    | "invalid"
    | "forbidden"
    | "not-found"
    | "conflict"
    | "error"
  readonly message: string
  readonly fields: {
    readonly gymId: FieldViewModel
    readonly routeId: FieldViewModel
    readonly areaId: FieldViewModel
    readonly order: FieldViewModel
    readonly positionLabel: FieldViewModel
    readonly setOn: FieldViewModel
    readonly setterName: FieldViewModel
    readonly routeImage: FieldViewModel
  }
  readonly errors: Record<keyof EditGymRouteViewModel["fields"], string>
}

export const editGymRouteInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    routeId: { label: "Route", value: "" },
    areaId: { label: "Area", value: "" },
    order: { label: "Order", value: "" },
    positionLabel: { label: "Position label (optional)", value: "" },
    setOn: { label: "Set on", value: "" },
    setterName: { label: "Setter name (optional)", value: "" },
    routeImage: { label: "Replace image (optional)", value: "" },
  },
  errors: {
    gymId: "",
    routeId: "",
    areaId: "",
    order: "",
    positionLabel: "",
    setOn: "",
    setterName: "",
    routeImage: "",
  },
} satisfies EditGymRouteViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
