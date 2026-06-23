"use client"

import { useActionState } from "react"
import type { SignInViewModel } from "@auth/adapters-next"
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
    email: { status: "valid", value: "" },
    password: { status: "valid", value: "" },
  },
} as const satisfies SignInViewModel

export function SignInView({
  action,
}: {
  action: (
    previousState: SignInViewModel,
    formData: FormData
  ) => Promise<SignInViewModel>
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const emailError =
    state.fields.email.status === "invalid" ? state.fields.email.error : ""
  const passwordError =
    state.fields.password.status === "invalid"
      ? state.fields.password.error
      : ""

  return (
    <Card className="w-[min(28rem,calc(100vw-2rem))]">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to continue to Kryno.
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
                autoComplete="current-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? "password-error" : undefined
                }
              />
              <FieldError id="password-error">{passwordError}</FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="/sign-up">Sign up</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
