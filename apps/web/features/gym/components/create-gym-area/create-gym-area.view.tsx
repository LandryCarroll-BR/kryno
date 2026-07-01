"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import {
  createGymAreaInitialViewModel,
  type CreateGymAreaViewModel,
} from "@gym/adapters-next/view-models/create-gym-area"

type CreateGymAreaAction = (
  previousState: CreateGymAreaViewModel,
  formData: FormData
) => Promise<CreateGymAreaViewModel>

export function CreateGymAreaView({
  action,
  gymId,
}: {
  action: CreateGymAreaAction
  gymId: string
}) {
  const [state, formAction, pending] = useActionState(action, {
    ...createGymAreaInitialViewModel,
    fields: {
      ...createGymAreaInitialViewModel.fields,
      gymId: {
        ...createGymAreaInitialViewModel.fields.gymId,
        value: gymId,
      },
    },
  })

  return (
    <form action={formAction}>
      <input type="hidden" name="gymId" value={gymId} />
      <FieldGroup>
        {state.message !== "" && (
          <Alert
            variant={state.status === "success" ? "default" : "destructive"}
          >
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <Field data-invalid={Boolean(state.errors.name)}>
          <FieldLabel htmlFor={`area-name-${gymId}`}>
            {state.fields.name.label}
          </FieldLabel>
          <Input
            id={`area-name-${gymId}`}
            name="name"
            placeholder="Horseshoe"
            disabled={pending}
            defaultValue={state.fields.name.value}
            aria-invalid={Boolean(state.errors.name)}
            aria-describedby={
              state.errors.name ? `area-name-${gymId}-error` : undefined
            }
          />
          <FieldError id={`area-name-${gymId}-error`}>
            {state.errors.name}
          </FieldError>
        </Field>
        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating area..." : "Create area"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
