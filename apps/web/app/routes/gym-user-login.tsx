import { RiArrowRightLine } from "@remixicon/react"
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router"

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

import type { Route } from "./+types/gym-user-login"
import { serializeGymUserSessionCookie } from "../lib/gym-user-session-cookie"
import { getKrynoApiClient, type KrynoApiClient } from "../lib/kryno-api-client"

type FieldName = "email" | "password"

export interface LoginActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

const failureMessages = {
  invalidInput: "Check the highlighted fields and try again.",
  invalidCredentials: "That email and password combination did not work.",
  unverified: "Please verify your email before signing in.",
}

const readFormString = (formData: FormData, name: FieldName) => {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

const validateLogin = (input: Record<FieldName, string>) => {
  const fieldErrors: Partial<Record<FieldName, string>> = {}

  if (!input.email) {
    fieldErrors.email = "Enter your email."
  } else if (!input.email.includes("@")) {
    fieldErrors.email = "Enter a valid email."
  }

  if (!input.password) {
    fieldErrors.password = "Enter your password."
  }

  return fieldErrors
}

const isExpectedLoginFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  (error._tag === "GymUserInvalidCredentials" ||
    error._tag === "GymUserUnverified")

const loginFailureMessage = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  error._tag === "GymUserUnverified"
    ? failureMessages.unverified
    : failureMessages.invalidCredentials

const redirectToAppWithSessionCookie = (
  sessionId: string,
  request: Request
) => {
  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    serializeGymUserSessionCookie(sessionId, request)
  )

  return redirect("/app", { headers })
}

export const createGymUserLoginAction =
  (getClient: (request: Request) => Promise<KrynoApiClient>) =>
  async ({
    request,
  }: Route.ActionArgs): Promise<Response | LoginActionData> => {
    const formData = await request.formData()
    const input = {
      email: readFormString(formData, "email").toLowerCase(),
      password: readFormString(formData, "password"),
    }
    const fieldErrors = validateLogin(input)

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        formError: failureMessages.invalidInput,
        fieldErrors,
      }
    }

    const client = await getClient(request)

    try {
      const response = await client.loginGymUser(input)
      return redirectToAppWithSessionCookie(response.session.id, request)
    } catch (error) {
      if (isExpectedLoginFailure(error)) {
        return {
          status: "error",
          formError: loginFailureMessage(error),
        }
      }

      throw error
    }
  }

export const action = createGymUserLoginAction(getKrynoApiClient)

export default function GymUserLogin() {
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
                Sign in to your gym account
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Continue to your gym dashboard with your verified account.
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
                    data-invalid={Boolean(actionData?.fieldErrors?.password)}
                  >
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                      required
                    />
                    <FieldError>{actionData?.fieldErrors?.password}</FieldError>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in" : "Sign in"}
                  <RiArrowRightLine aria-hidden="true" />
                </Button>
                <Link to="/signup" className={buttonVariants()}>
                  Create account
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </main>
  )
}
