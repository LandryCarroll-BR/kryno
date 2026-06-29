export type GetCurrentUserViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly username: FieldViewModel
  }
  readonly errors: Record<keyof GetCurrentUserViewModel["fields"], string>
}

export const getCurrentUserInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    username: {
      label: "Username",
      value: "",
    },
  },
  errors: {
    username: "",
  },
} satisfies GetCurrentUserViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
