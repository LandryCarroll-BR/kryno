"use client"

import { useActionState } from "react"
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

import {
  signUpInitialViewModel,
  type SignUpViewModel,
} from "@auth/adapters-next/view-models/sign-up"

type SignUpAction = (
  previousState: SignUpViewModel,
  formData: FormData
) => Promise<SignUpViewModel>

export function SignUpView({ action }: { action: SignUpAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    signUpInitialViewModel
  )

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
            {state.message !== "" && (
              <Alert
                variant={state.status === "success" ? "default" : "destructive"}
              >
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(state.errors.username)}>
              <FieldLabel htmlFor="username">
                {state.fields.username.label}
              </FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                disabled={pending}
                defaultValue={state.fields.username.value}
                aria-invalid={Boolean(state.errors.username)}
                aria-describedby={
                  state.errors.username ? "username-error" : undefined
                }
                placeholder="yourname"
              />
              <FieldError id="username-error">
                {state.errors.username}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.email)}>
              <FieldLabel htmlFor="email">
                {state.fields.email.label}
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={pending}
                defaultValue={state.fields.email.value}
                aria-invalid={Boolean(state.errors.email)}
                aria-describedby={
                  state.errors.email ? "email-error" : undefined
                }
                placeholder="you@example.com"
              />
              <FieldError id="email-error">{state.errors.email}</FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.password)}>
              <FieldLabel htmlFor="password">
                {state.fields.password.label}
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                disabled={pending}
                defaultValue={state.fields.password.value}
                aria-invalid={Boolean(state.errors.password)}
                aria-describedby={
                  state.errors.password ? "password-error" : undefined
                }
                placeholder="At least 8 characters"
              />
              <FieldError id="password-error">
                {state.errors.password}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword">
                {state.fields.confirmPassword.label}
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={pending}
                defaultValue={state.fields.confirmPassword.value}
                aria-invalid={Boolean(state.errors.confirmPassword)}
                aria-describedby={
                  state.errors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
                placeholder="Re-enter your password"
              />
              <FieldError id="confirm-password-error">
                {state.errors.confirmPassword}
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
