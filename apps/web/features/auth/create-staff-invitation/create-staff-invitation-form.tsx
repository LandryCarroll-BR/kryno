import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function CreateStaffInvitationForm({
  fieldError,
}: {
  readonly fieldError?: string
}) {
  const hasFieldError = fieldError !== undefined

  return (
    <form
      method="post"
      action="/app/create-staff-invitation"
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">Invite staff</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter a gym ID and email address to create a staff invitation.
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field data-invalid={hasFieldError}>
            <FieldLabel htmlFor="create-staff-invitation-gym-id">
              Gym ID
            </FieldLabel>
            <Input
              id="create-staff-invitation-gym-id"
              name="gymId"
              autoComplete="off"
              aria-invalid={hasFieldError}
              required
            />
            <FieldError>{fieldError}</FieldError>
          </Field>

          <Field data-invalid={hasFieldError}>
            <FieldLabel htmlFor="create-staff-invitation-email">
              Staff email
            </FieldLabel>
            <Input
              id="create-staff-invitation-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={hasFieldError}
              required
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button type="submit" className="w-full">
        Invite staff
      </Button>
    </form>
  )
}
