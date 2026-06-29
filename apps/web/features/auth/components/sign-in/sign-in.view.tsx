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
  signInInitialViewModel,
  type SignInViewModel,
} from "@auth/adapters-next/view-models/sign-in"

type SignInAction = (
  previousState: SignInViewModel,
  formData: FormData
) => Promise<SignInViewModel>

export function SignInView({ action }: { action: SignInAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    signInInitialViewModel
  )

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
            {state.message !== "" && (
              <Alert
                variant={state.status === "success" ? "default" : "destructive"}
              >
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

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
                autoComplete="current-password"
                disabled={pending}
                defaultValue={state.fields.password.value}
                aria-invalid={Boolean(state.errors.password)}
                aria-describedby={
                  state.errors.password ? "password-error" : undefined
                }
              />
              <FieldError id="password-error">
                {state.errors.password}
              </FieldError>
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
