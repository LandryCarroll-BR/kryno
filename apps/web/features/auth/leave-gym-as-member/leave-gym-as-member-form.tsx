import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function LeaveGymAsMemberForm({
  fieldError,
}: {
  readonly fieldError?: string
}) {
  const hasGymIdError = fieldError !== undefined

  return (
    <form
      method="post"
      action="/app/leave-gym"
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">Leave gym</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter a gym ID to leave as a member.
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field data-invalid={hasGymIdError}>
            <FieldLabel htmlFor="leave-gym-id">Gym ID</FieldLabel>
            <Input
              id="leave-gym-id"
              name="gymId"
              autoComplete="off"
              aria-invalid={hasGymIdError}
              required
            />
            <FieldError>{fieldError}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button type="submit" className="w-full">
        Leave gym
      </Button>
    </form>
  )
}
