export type CreateGymRouteViewModel = {
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
    readonly areaId: FieldViewModel
    readonly order: FieldViewModel
    readonly positionLabel: FieldViewModel
    readonly setOn: FieldViewModel
    readonly setterName: FieldViewModel
    readonly boulderId: FieldViewModel
  }
  readonly errors: Record<
    keyof CreateGymRouteViewModel["fields"],
    string
  >
}

export const createGymRouteInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    areaId: { label: "Area", value: "" },
    order: { label: "Order", value: "" },
    positionLabel: { label: "Position label (optional)", value: "" },
    setOn: { label: "Set on", value: "" },
    setterName: { label: "Setter name (optional)", value: "" },
    boulderId: { label: "Boulder (optional)", value: "" },
  },
  errors: {
    gymId: "",
    areaId: "",
    order: "",
    positionLabel: "",
    setOn: "",
    setterName: "",
    boulderId: "",
  },
} satisfies CreateGymRouteViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
