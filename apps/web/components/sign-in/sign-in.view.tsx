"use client"

import { use, useActionState } from "react"
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
    email: { value: "" },
    password: { value: "" },
  },
} as const

export function SignInView({
  action,
  searchParams,
}: {
  action: (
    redirectUrl: string | undefined,
    previousState: SignInViewModel,
    formData: FormData
  ) => Promise<SignInViewModel>
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams && use(searchParams)
  const signIn = action.bind(null, params?.from)
  const [state, formAction, pending] = useActionState(signIn, initialState)

  const signUpUrl = params?.from
    ? `/sign-up?from=${encodeURIComponent(params.from)}`
    : "/sign-up"

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
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

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
                autoComplete="current-password"
                aria-invalid={Boolean(state.fields.password.error)}
                aria-describedby={
                  state.fields.password.error ? "password-error" : undefined
                }
              />
              <FieldError id="password-error">
                {state.fields.password.error}
              </FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href={signUpUrl}>Sign up</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
