import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"

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

import type { AcceptStaffInvitationActionData } from "./accept-staff-invitation-view-model"

export function AcceptStaffInvitationForm({
  actionData,
  initialToken,
  isSubmitting = false,
}: {
  readonly actionData?: AcceptStaffInvitationActionData
  readonly initialToken: string
  readonly isSubmitting?: boolean
}) {
  return (
    <form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {actionData?.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(actionData?.fieldErrors?.token)}>
            <FieldLabel htmlFor="token">Invitation token</FieldLabel>
            <Input
              id="token"
              name="token"
              type="text"
              autoComplete="one-time-code"
              aria-invalid={Boolean(actionData?.fieldErrors?.token)}
              defaultValue={initialToken}
              required
            />
            <FieldError>{actionData?.fieldErrors?.token}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Accepting invitation" : "Accept invitation"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
        <a href="/app" className={buttonVariants()}>
          <RiArrowLeftLine aria-hidden="true" />
          Back to dashboard
        </a>
      </div>
    </form>
  )
}
