export type CreateBoulderViewModel = {
  status: "idle" | "success"
  message: string
  fields: {
    name: {
      value: string
      label: string
      error: string
    }
    grade: {
      value: BoulderGradeOption
      label: string
      error: string
    }
    wallAngle: {
      value: WallAngleOption
      label: string
      error: string
    }
    movementStyle: {
      value: MovementStyleOption
      label: string
      error: string
    }
  }
}

export const gradeOptions = [
  "VB",
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
] as const

export type BoulderGradeOption = (typeof gradeOptions)[number]

export const wallAngleOptions = [
  { label: "Slab", value: "SLAB" },
  { label: "Vertical", value: "VERTICAL" },
  { label: "Overhang", value: "OVERHANG" },
  { label: "Roof", value: "ROOF" },
] as const

export type WallAngleOption = (typeof wallAngleOptions)[number]["value"]

export const movementStyleOptions = [
  { label: "Coordination", value: "COORDINATION" },
  { label: "Power", value: "POWER" },
  { label: "Technical", value: "TECHNICAL" },
] as const

export type MovementStyleOption =
  (typeof movementStyleOptions)[number]["value"]

export const createBoulderInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    name: {
      value: "",
      label: "Name",
      error: "",
    },
    grade: {
      value: "V4",
      label: "Grade",
      error: "",
    },
    wallAngle: {
      value: "OVERHANG",
      label: "Wall angle",
      error: "",
    },
    movementStyle: {
      value: "POWER",
      label: "Movement style",
      error: "",
    },
  },
} satisfies CreateBoulderViewModel
