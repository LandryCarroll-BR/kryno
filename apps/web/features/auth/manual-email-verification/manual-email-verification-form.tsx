import { RiArrowRightLine } from "@remixicon/react"
import {
  Form,
  Link,
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

import type { ManualEmailVerificationAction } from "../../../features/auth/manual-email-verification/manual-email-verification-action"

export function ManualEmailVerificationForm() {
  const actionData = useActionData<ManualEmailVerificationAction>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const isSubmitting = navigation.state === "submitting"
  const email = searchParams.get("email")

  return (
    <Form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {actionData?.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
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
              aria-describedby={email ? "verification-email" : undefined}
              required
            />
            {email && (
              <p
                id="verification-email"
                className="text-sm text-muted-foreground"
              >
                Sent to {email}
              </p>
            )}
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
  )
}
