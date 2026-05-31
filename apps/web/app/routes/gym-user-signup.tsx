import { RiArrowRightLine } from "@remixicon/react"
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router"
import { Effect } from "effect"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import type { Route } from "./+types/gym-user-signup"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiEffect,
} from "../../lib/kryno-api/kryno-api-client"

type FieldName = "email" | "password" | "displayName"
type SignUpGymUserRequest = Parameters<
  KrynoApiClient["auth"]["signUpGymUser"]
>[0]

export interface SignupActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

const failureMessages = {
  emailReserved: "That email is already reserved. Try signing in instead.",
  invalidInput: "Check the highlighted fields and try again.",
}

const readFormString = (formData: FormData, name: FieldName) => {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

const validateSignup = (input: Record<FieldName, string>) => {
  const fieldErrors: Partial<Record<FieldName, string>> = {}

  if (!input.email) {
    fieldErrors.email = "Enter your email."
  } else if (!input.email.includes("@")) {
    fieldErrors.email = "Enter a valid email."
  }

  if (!input.password) {
    fieldErrors.password = "Enter a password."
  } else if (input.password.length < 8) {
    fieldErrors.password = "Use at least 8 characters."
  }

  if (!input.displayName) {
    fieldErrors.displayName = "Enter your display name."
  }

  return fieldErrors
}

const isExpectedSignupFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  error._tag === "GymUserEmailAlreadyReserved"

export const createGymUserSignupAction =
  (
    getClient: () => Promise<{
      readonly auth: {
        readonly signUpGymUser: (
          request: SignUpGymUserRequest
        ) => KrynoApiEffect
      }
    }>
  ) =>
  async ({
    request,
  }: Route.ActionArgs): Promise<Response | SignupActionData> => {
    const formData = await request.formData()
    const input = {
      email: readFormString(formData, "email").toLowerCase(),
      password: readFormString(formData, "password"),
      displayName: readFormString(formData, "displayName"),
    }
    const fieldErrors = validateSignup(input)

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        formError: failureMessages.invalidInput,
        fieldErrors,
      }
    }

    const client = await getClient()

    try {
      await Effect.runPromise(client.auth.signUpGymUser({ payload: input }))
    } catch (error) {
      if (isExpectedSignupFailure(error)) {
        return {
          status: "error",
          formError: failureMessages.emailReserved,
          fieldErrors: {
            email: failureMessages.emailReserved,
          },
        }
      }

      throw error
    }

    return redirect(`/verify-email?email=${encodeURIComponent(input.email)}`)
  }

export const action = createGymUserSignupAction(getKrynoApiClient)

export default function GymUserSignup() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Create your gym account
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Start with your account details. Email verification comes next.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-start lg:justify-self-end">
            <Form method="post" className="space-y-6">
              <FieldSet>
                <FieldGroup>
                  {actionData?.formError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {actionData.formError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Field data-invalid={Boolean(actionData?.fieldErrors?.email)}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                      required
                    />
                    <FieldError>{actionData?.fieldErrors?.email}</FieldError>
                  </Field>

                  <Field
                    data-invalid={Boolean(actionData?.fieldErrors?.displayName)}
                  >
                    <FieldLabel htmlFor="displayName">Display name</FieldLabel>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      aria-invalid={Boolean(
                        actionData?.fieldErrors?.displayName
                      )}
                      required
                    />
                    <FieldError>
                      {actionData?.fieldErrors?.displayName}
                    </FieldError>
                  </Field>

                  <Field
                    data-invalid={Boolean(actionData?.fieldErrors?.password)}
                  >
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                      required
                      minLength={8}
                    />
                    <FieldError>{actionData?.fieldErrors?.password}</FieldError>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account" : "Create account"}
                  <RiArrowRightLine aria-hidden="true" />
                </Button>
                <Link to="/" className={buttonVariants()}>
                  Back
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </main>
  )
}
