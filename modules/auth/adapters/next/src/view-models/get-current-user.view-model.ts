export type GetCurrentUserViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly role: CurrentUserRole | null
  readonly fields: {
    readonly username: FieldViewModel
  }
  readonly errors: Record<keyof GetCurrentUserViewModel["fields"], string>
}

export const getCurrentUserInitialViewModel = {
  status: "idle",
  message: "",
  role: null,
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

export type CurrentUserRole = "user" | "admin"

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
