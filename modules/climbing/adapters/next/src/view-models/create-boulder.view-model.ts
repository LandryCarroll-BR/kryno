export type CreateBoulderViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly name: FieldViewModel
    readonly grade: FieldViewModel
    readonly wallAngle: FieldViewModel
    readonly movementStyle: FieldViewModel
  }
  readonly errors: Record<keyof CreateBoulderViewModel["fields"], string>
}

export const gradeOptions = [
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

export const wallAngleOptions = [
  { label: "Slab", value: "SLAB" },
  { label: "Vertical", value: "VERTICAL" },
  { label: "Overhang", value: "OVERHANG" },
  { label: "Roof", value: "ROOF" },
] as const satisfies readonly FieldViewModel[]

export const movementStyleOptions = [
  { label: "Coordination", value: "COORDINATION" },
  { label: "Power", value: "POWER" },
  { label: "Technical", value: "TECHNICAL" },
] as const satisfies readonly FieldViewModel[]

export const createBoulderInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    name: {
      value: "",
      label: "Name",
    },
    grade: {
      value: "V4",
      label: "Grade",
    },
    wallAngle: {
      value: "OVERHANG",
      label: "Wall angle",
    },
    movementStyle: {
      value: "POWER",
      label: "Movement style",
    },
  },
  errors: {
    grade: "",
    movementStyle: "",
    name: "",
    wallAngle: "",
  },
} satisfies CreateBoulderViewModel

type FieldViewModel = {
  readonly value: string
  readonly label: string
}
