"use client"

import { use, useActionState } from "react"
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

const initialState = {
  status: "idle",
  fields: {
    username: { value: "" },
    email: { value: "" },
    password: { value: "" },
    confirmPassword: { value: "" },
  },
} as const

export function SignUpView({
  action,
  searchParams,
}: {
  action: (
    redirectUrl: string | undefined,
    previousState: SignUpViewModel,
    formData: FormData
  ) => Promise<SignUpViewModel>
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams && use(searchParams)
  const signUp = action.bind(null, params?.from)
  const [state, formAction, pending] = useActionState(signUp, initialState)

  const signInUrl = params?.from
    ? `/sign-in?from=${encodeURIComponent(params.from)}`
    : "/sign-in"

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
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(state.fields.username.error)}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                defaultValue={state.fields.username.value}
                aria-invalid={Boolean(state.fields.username.error)}
                aria-describedby={
                  state.fields.username.error ? "username-error" : undefined
                }
                placeholder="yourname"
              />
              <FieldError id="username-error">
                {state.fields.username.error}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fields.email.error)}>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.fields.email.value}
                aria-invalid={Boolean(state.fields.email.error)}
                aria-describedby={
                  state.fields.email.error ? "email-error" : undefined
                }
                placeholder="you@example.com"
              />
              <FieldError id="email-error">
                {state.fields.email.error}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fields.password.error)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(state.fields.password.error)}
                aria-describedby={
                  state.fields.password.error ? "password-error" : undefined
                }
                placeholder="At least 8 characters"
              />
              <FieldError id="password-error">
                {state.fields.password.error}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fields.confirmPassword.error)}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(state.fields.confirmPassword.error)}
                aria-describedby={
                  state.fields.confirmPassword.error
                    ? "confirm-password-error"
                    : undefined
                }
                placeholder="Re-enter your password"
              />
              <FieldError id="confirm-password-error">
                {state.fields.confirmPassword.error}
              </FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Sign up"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <a href={signInUrl}>Sign in</a>
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
