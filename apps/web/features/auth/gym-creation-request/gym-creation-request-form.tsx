import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function GymCreationRequestForm({
  fieldError,
}: {
  readonly fieldError?: string
}) {
  const hasNameError = fieldError !== undefined

  return (
    <form
      method="post"
      action="/app/gym-creation-request"
      className="space-y-4 rounded-lg border border-border p-4"
    >
      <div className="space-y-1">
        <h2 className="font-semibold">Request gym creation</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Submit a gym name for approval.
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field data-invalid={hasNameError}>
            <FieldLabel htmlFor="gym-creation-request-name">
              Gym name
            </FieldLabel>
            <Input
              id="gym-creation-request-name"
              name="name"
              autoComplete="organization"
              aria-invalid={hasNameError}
              required
            />
            <FieldError>{fieldError}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button type="submit" className="w-full">
        Request gym
      </Button>
    </form>
  )
}
