export type SignOutViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {}
  readonly errors: Record<keyof SignOutViewModel["fields"], string>
}

export const signOutInitialViewModel = {
  status: "idle",
  message: "",
  fields: {},
  errors: {},
} satisfies SignOutViewModel
