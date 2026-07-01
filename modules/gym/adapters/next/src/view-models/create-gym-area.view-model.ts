export type CreateGymAreaViewModel = {
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
    readonly name: FieldViewModel
  }
  readonly errors: Record<
    keyof CreateGymAreaViewModel["fields"],
    string
  >
}

export const createGymAreaInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    name: { label: "Area name", value: "" },
  },
  errors: {
    gymId: "",
    name: "",
  },
} satisfies CreateGymAreaViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
