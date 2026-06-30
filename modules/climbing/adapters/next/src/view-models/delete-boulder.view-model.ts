export type DeleteBoulderViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly boulderId: FieldViewModel
  }
  readonly errors: Record<keyof DeleteBoulderViewModel["fields"], string>
}

export const deleteBoulderInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    boulderId: {
      label: "Boulder ID",
      value: "",
    },
  },
  errors: {
    boulderId: "",
  },
} satisfies DeleteBoulderViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
