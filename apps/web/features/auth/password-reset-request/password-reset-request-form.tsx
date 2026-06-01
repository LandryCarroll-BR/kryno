import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"
import { Form, Link, useActionData, useNavigation } from "react-router"

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

import type { PasswordResetRequestAction } from "../../../features/auth/password-reset-request/password-reset-request-action"

export function PasswordResetRequestForm() {
  const actionData = useActionData<PasswordResetRequestAction>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <Form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {actionData?.status === "success" && (
            <Alert>
              <AlertDescription>{actionData.message}</AlertDescription>
            </Alert>
          )}

          {actionData?.status === "error" && actionData.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <Field
            data-invalid={Boolean(
              actionData?.status === "error" && actionData.fieldErrors?.email
            )}
          >
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(
                actionData?.status === "error" &&
                  actionData.fieldErrors?.email
              )}
              required
            />
            <FieldError>
              {actionData?.status === "error" && actionData.fieldErrors?.email}
            </FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending reset link" : "Send reset link"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
        <Link to="/login" className={buttonVariants()}>
          <RiArrowLeftLine aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </Form>
  )
}
