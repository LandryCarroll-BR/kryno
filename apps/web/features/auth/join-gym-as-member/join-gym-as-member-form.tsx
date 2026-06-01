import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function JoinGymAsMemberForm({
  fieldError,
}: {
  readonly fieldError?: string
}) {
  const hasGymIdError = fieldError !== undefined

  return (
    <form
      method="post"
      action="/app/join-gym"
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">Join gym</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter a gym ID to join as a member.
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field data-invalid={hasGymIdError}>
            <FieldLabel htmlFor="join-gym-id">Gym ID</FieldLabel>
            <Input
              id="join-gym-id"
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
        Join gym
      </Button>
    </form>
  )
}
