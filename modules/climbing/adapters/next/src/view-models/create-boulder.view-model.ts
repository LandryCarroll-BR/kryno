export type CreateBoulderFormViewModel = {
  readonly gradeOptions: readonly string[]
  readonly wallAngleOptions: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly movementStyleOptions: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly defaultValues: {
    readonly grade: string
    readonly wallAngle: string
    readonly movementStyle: string
  }
}

export type CreateBoulderFieldViewModel =
  | {
      readonly status: "valid"
      readonly value: string
    }
  | {
      readonly status: "invalid"
      readonly value: string
      readonly error: string
    }

export type CreateBoulderFieldsViewModel = {
  readonly name: CreateBoulderFieldViewModel
  readonly grade: CreateBoulderFieldViewModel
  readonly wallAngle: CreateBoulderFieldViewModel
  readonly movementStyle: CreateBoulderFieldViewModel
}

export type CreateBoulderFieldErrorsViewModel = {
  readonly name: string
  readonly grade: string
  readonly wallAngle: string
  readonly movementStyle: string
}

export type CreateBoulderViewModel = (
  | {
      readonly status: "idle"
      readonly fields: CreateBoulderFieldsViewModel
      readonly fieldErrors: CreateBoulderFieldErrorsViewModel
    }
  | {
      readonly status: "success"
      readonly boulderId: string
      readonly name: string
      readonly grade: string
      readonly fields: CreateBoulderFieldsViewModel
      readonly fieldErrors: CreateBoulderFieldErrorsViewModel
    }
  | {
      readonly status: "error"
      readonly error: string
      readonly fields: CreateBoulderFieldsViewModel
      readonly fieldErrors: CreateBoulderFieldErrorsViewModel
    }
) & {
  readonly form: CreateBoulderFormViewModel
}

const boulderGrades = [
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

export const createBoulderForm = {
  gradeOptions: boulderGrades,
  wallAngleOptions,
  movementStyleOptions,
  defaultValues: {
    grade: "V4",
    wallAngle: "OVERHANG",
    movementStyle: "POWER",
  },
} satisfies CreateBoulderFormViewModel

export const createBoulderInitialViewModel = {
  status: "idle",
  form: createBoulderForm,
  fields: {
    name: { status: "valid", value: "" },
    grade: { status: "valid", value: createBoulderForm.defaultValues.grade },
    wallAngle: {
      status: "valid",
      value: createBoulderForm.defaultValues.wallAngle,
    },
    movementStyle: {
      status: "valid",
      value: createBoulderForm.defaultValues.movementStyle,
    },
  },
  fieldErrors: {
    name: "",
    grade: "",
    wallAngle: "",
    movementStyle: "",
  },
} satisfies CreateBoulderViewModel
