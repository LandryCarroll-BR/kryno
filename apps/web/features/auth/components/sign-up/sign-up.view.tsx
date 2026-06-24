"use client"

import { useActionState } from "react"
import type { SignUpViewModel } from "@auth/adapters-next"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import { Input } from "@packages/ui/components/input"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@packages/ui/components/field"

import { signUp } from "@/features/auth/components/sign-up/sign-up.action"

const initialState = {
  status: "idle",
  fields: {
    username: { status: "valid", value: "" },
    email: { status: "valid", value: "" },
    password: { status: "valid", value: "" },
    confirmPassword: { status: "valid", value: "" },
  },
} as const satisfies SignUpViewModel

export function SignUpView({ action }: { action: typeof signUp }) {
  const [state, formAction, pending] = useActionState(action, initialState)

  const usernameError =
    state.fields.username.status === "invalid"
      ? state.fields.username.error
      : ""

  const emailError =
    state.fields.email.status === "invalid" ? state.fields.email.error : ""

  const passwordError =
    state.fields.password.status === "invalid"
      ? state.fields.password.error
      : ""

  const confirmPasswordError =
    state.fields.confirmPassword.status === "invalid"
      ? state.fields.confirmPassword.error
      : ""

  return (
    <Card className="w-[min(28rem,calc(100vw-2rem))]">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join Kryno and start building something great.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {state.status === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(usernameError)}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                defaultValue={state.fields.username.value}
                aria-invalid={Boolean(usernameError)}
                aria-describedby={usernameError ? "username-error" : undefined}
                placeholder="yourname"
              />
              <FieldError id="username-error">{usernameError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(emailError)}>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.fields.email.value}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                placeholder="you@example.com"
              />
              <FieldError id="email-error">{emailError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(passwordError)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? "password-error" : undefined}
                placeholder="At least 8 characters"
              />
              <FieldError id="password-error">{passwordError}</FieldError>
            </Field>

            <Field data-invalid={Boolean(confirmPasswordError)}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmPasswordError)}
                aria-describedby={
                  confirmPasswordError ? "confirm-password-error" : undefined
                }
                placeholder="Re-enter your password"
              />
              <FieldError id="confirm-password-error">
                {confirmPasswordError}
              </FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Sign up"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <a href="/sign-in">Sign in</a>
              </FieldDescription>
              <FieldDescription className="text-center text-xs">
                By creating an account, you agree to our{" "}
                <a href="/terms">Terms</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
