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
      value: (typeof gradeOptions)[number]
      label: string
      error: string
    }
    wallAngle: {
      value: (typeof wallAngleOptions)[number]
      label: string
      error: string
    }
    movementAngle: {
      value: (typeof movementStyleOptions)[number]
      label: string
      error: string
    }
  }
}

const gradeOptions = [
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
]

const wallAngleOptions = [
  { label: "Slab", value: "SLAB" },
  { label: "Vertical", value: "VERTICAL" },
  { label: "Overhang", value: "OVERHANG" },
  { label: "Roof", value: "ROOF" },
]

const movementStyleOptions = [
  { label: "Coordination", value: "COORDINATION" },
  { label: "Power", value: "POWER" },
  { label: "Technical", value: "TECHNICAL" },
]
