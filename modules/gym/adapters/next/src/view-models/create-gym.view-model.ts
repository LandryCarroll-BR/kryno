export type CreateGymViewModel = {
  readonly status: "idle" | "success" | "invalid" | "forbidden" | "error"
  readonly message: string
  readonly fields: {
    readonly name: FieldViewModel
  }
  readonly errors: Record<keyof CreateGymViewModel["fields"], string>
}

export const createGymInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    name: {
      label: "Name",
      value: "",
    },
  },
  errors: {
    name: "",
  },
} satisfies CreateGymViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
