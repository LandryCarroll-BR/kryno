export type SignUpViewModel = {
  readonly status: "idle" | "success" | "invalid" | "error"
  readonly message: string
  readonly fields: {
    readonly username: FieldViewModel
    readonly email: FieldViewModel
    readonly password: FieldViewModel
    readonly confirmPassword: FieldViewModel
  }
  readonly errors: Record<keyof SignUpViewModel["fields"], string>
}

export const signUpInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    username: {
      label: "Username",
      value: "",
    },
    email: {
      label: "Email address",
      value: "",
    },
    password: {
      label: "Password",
      value: "",
    },
    confirmPassword: {
      label: "Confirm password",
      value: "",
    },
  },
  errors: {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
} satisfies SignUpViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
