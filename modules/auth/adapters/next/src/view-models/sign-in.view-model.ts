export type SignInViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly email: FieldViewModel
    readonly password: FieldViewModel
  }
  readonly errors: Record<keyof SignInViewModel["fields"], string>
}

export const signInInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    email: {
      label: "Email address",
      value: "",
    },
    password: {
      label: "Password",
      value: "",
    },
  },
  errors: {
    email: "",
    password: "",
  },
} satisfies SignInViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
