import { RiArrowRightLine } from "@remixicon/react"
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
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

import type { Route } from "./+types/manual-email-verification"
import { getKrynoApiClient, type KrynoApiClient } from "../lib/kryno-api-client"

type FieldName = "token"

export interface ManualEmailVerificationActionData {
  readonly status: "error"
  readonly formError?: string
  readonly fieldErrors?: Partial<Record<FieldName, string>>
}

const failureMessages = {
  invalidInput: "Check the highlighted fields and try again.",
  invalidToken: "That verification token is invalid or expired.",
}

const readFormString = (formData: FormData, name: FieldName) => {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

const validateVerification = (input: Record<FieldName, string>) => {
  const fieldErrors: Partial<Record<FieldName, string>> = {}

  if (!input.token) {
    fieldErrors.token = "Enter your verification token."
  }

  return fieldErrors
}

const isExpectedVerificationFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  (error._tag === "GymUserEmailVerificationInvalid" ||
    error._tag === "GymUserNotFound")

export const createManualEmailVerificationAction =
  (getClient: (request: Request) => Promise<KrynoApiClient>) =>
  async ({
    request,
  }: Route.ActionArgs): Promise<Response | ManualEmailVerificationActionData> => {
    const formData = await request.formData()
    const input = {
      token: readFormString(formData, "token"),
    }
    const fieldErrors = validateVerification(input)

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        formError: failureMessages.invalidInput,
        fieldErrors,
      }
    }

    const client = await getClient(request)

    try {
      await client.verifyGymUserEmail(input)
    } catch (error) {
      if (isExpectedVerificationFailure(error)) {
        return {
          status: "error",
          formError: failureMessages.invalidToken,
          fieldErrors: {
            token: failureMessages.invalidToken,
          },
        }
      }

      throw error
    }

    return redirect("/login")
  }

export const action = createManualEmailVerificationAction(getKrynoApiClient)

export default function ManualEmailVerification() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const isSubmitting = navigation.state === "submitting"
  const email = searchParams.get("email")

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Verify your email
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Enter the development verification token
                {email ? ` for ${email}` : ""} to activate your gym account.
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

                  <Field data-invalid={Boolean(actionData?.fieldErrors?.token)}>
                    <FieldLabel htmlFor="token">Verification token</FieldLabel>
                    <Input
                      id="token"
                      name="token"
                      type="text"
                      autoComplete="one-time-code"
                      aria-invalid={Boolean(actionData?.fieldErrors?.token)}
                      required
                    />
                    <FieldError>{actionData?.fieldErrors?.token}</FieldError>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying email" : "Verify email"}
                  <RiArrowRightLine aria-hidden="true" />
                </Button>
                <Link to="/signup" className={buttonVariants()}>
                  Back to signup
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </main>
  )
}
