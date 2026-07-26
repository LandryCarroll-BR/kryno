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
    readonly boulderSource: FieldViewModel
    readonly boulderId: FieldViewModel
    readonly boulderName: FieldViewModel
    readonly boulderGrade: FieldViewModel
    readonly boulderWallAngle: FieldViewModel
    readonly boulderMovementStyle: FieldViewModel
  }
  readonly errors: Record<keyof CreateGymRouteViewModel["fields"], string>
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
    boulderSource: { label: "Boulder source", value: "existing" },
    boulderId: { label: "Boulder", value: "" },
    boulderName: { label: "Boulder name", value: "" },
    boulderGrade: { label: "Boulder grade", value: "V4" },
    boulderWallAngle: { label: "Wall angle", value: "OVERHANG" },
    boulderMovementStyle: { label: "Movement style", value: "POWER" },
  },
  errors: {
    gymId: "",
    areaId: "",
    order: "",
    positionLabel: "",
    setOn: "",
    setterName: "",
    boulderSource: "",
    boulderId: "",
    boulderName: "",
    boulderGrade: "",
    boulderWallAngle: "",
    boulderMovementStyle: "",
  },
} satisfies CreateGymRouteViewModel

export const boulderSourceOptions = [
  { label: "Existing boulder", value: "existing" },
  { label: "New boulder", value: "new" },
] as const satisfies readonly FieldViewModel[]

export const boulderGradeOptions = [
  { label: "VB", value: "VB" },
  { label: "V0", value: "V0" },
  { label: "V1", value: "V1" },
  { label: "V2", value: "V2" },
  { label: "V3", value: "V3" },
  { label: "V4", value: "V4" },
  { label: "V5", value: "V5" },
  { label: "V6", value: "V6" },
  { label: "V7", value: "V7" },
  { label: "V8", value: "V8" },
  { label: "V9", value: "V9" },
  { label: "V10", value: "V10" },
  { label: "V11", value: "V11" },
  { label: "V12", value: "V12" },
  { label: "V13", value: "V13" },
  { label: "V14", value: "V14" },
  { label: "V15", value: "V15" },
  { label: "V16", value: "V16" },
  { label: "V17", value: "V17" },
] as const satisfies readonly FieldViewModel[]

export const boulderWallAngleOptions = [
  { label: "Slab", value: "SLAB" },
  { label: "Vertical", value: "VERTICAL" },
  { label: "Overhang", value: "OVERHANG" },
  { label: "Roof", value: "ROOF" },
] as const satisfies readonly FieldViewModel[]

export const boulderMovementStyleOptions = [
  { label: "Coordination", value: "COORDINATION" },
  { label: "Power", value: "POWER" },
  { label: "Technical", value: "TECHNICAL" },
] as const satisfies readonly FieldViewModel[]

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
