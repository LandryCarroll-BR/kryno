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
  NativeSelect,
  NativeSelectOption,
} from "@packages/ui/components/native-select"
import {
  createGymRouteInitialViewModel,
  type CreateGymRouteViewModel,
} from "@gym/adapters-next/view-models/create-gym-route"
import type { GymBoulderOptionViewModel } from "@gym/adapters-next/view-models/get-gym-management"

type CreateGymRouteAction = (
  previousState: CreateGymRouteViewModel,
  formData: FormData
) => Promise<CreateGymRouteViewModel>

const localToday = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

export function CreateGymRouteView({
  action,
  gymId,
  areaId,
  boulders,
}: {
  action: CreateGymRouteAction
  gymId: string
  areaId: string
  boulders: readonly GymBoulderOptionViewModel[]
}) {
  const [state, formAction, pending] = useActionState(action, {
    ...createGymRouteInitialViewModel,
    fields: {
      ...createGymRouteInitialViewModel.fields,
      gymId: {
        ...createGymRouteInitialViewModel.fields.gymId,
        value: gymId,
      },
      areaId: {
        ...createGymRouteInitialViewModel.fields.areaId,
        value: areaId,
      },
      setOn: {
        ...createGymRouteInitialViewModel.fields.setOn,
        value: localToday(),
      },
    },
  })
  const prefix = `route-${areaId}`

  return (
    <form action={formAction} className="mt-6 border-t pt-6">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="areaId" value={areaId} />
      <FieldGroup>
        {state.message !== "" && (
          <Alert
            variant={state.status === "success" ? "default" : "destructive"}
          >
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(state.errors.order)}>
            <FieldLabel htmlFor={`${prefix}-order`}>
              {state.fields.order.label}
            </FieldLabel>
            <Input
              id={`${prefix}-order`}
              name="order"
              type="number"
              min={1}
              disabled={pending}
              defaultValue={state.fields.order.value}
              aria-invalid={Boolean(state.errors.order)}
            />
            <FieldError>{state.errors.order}</FieldError>
          </Field>
          <Field data-invalid={Boolean(state.errors.positionLabel)}>
            <FieldLabel htmlFor={`${prefix}-position`}>
              {state.fields.positionLabel.label}
            </FieldLabel>
            <Input
              id={`${prefix}-position`}
              name="positionLabel"
              placeholder="Left corner"
              disabled={pending}
              defaultValue={state.fields.positionLabel.value}
              aria-invalid={Boolean(state.errors.positionLabel)}
            />
            <FieldError>{state.errors.positionLabel}</FieldError>
          </Field>
          <Field data-invalid={Boolean(state.errors.setOn)}>
            <FieldLabel htmlFor={`${prefix}-set-on`}>
              {state.fields.setOn.label}
            </FieldLabel>
            <Input
              id={`${prefix}-set-on`}
              name="setOn"
              type="date"
              disabled={pending}
              defaultValue={state.fields.setOn.value}
              aria-invalid={Boolean(state.errors.setOn)}
            />
            <FieldError>{state.errors.setOn}</FieldError>
          </Field>
          <Field data-invalid={Boolean(state.errors.setterName)}>
            <FieldLabel htmlFor={`${prefix}-setter`}>
              {state.fields.setterName.label}
            </FieldLabel>
            <Input
              id={`${prefix}-setter`}
              name="setterName"
              placeholder="Setter name"
              disabled={pending}
              defaultValue={state.fields.setterName.value}
              aria-invalid={Boolean(state.errors.setterName)}
            />
            <FieldError>{state.errors.setterName}</FieldError>
          </Field>
        </div>
        <Field data-invalid={Boolean(state.errors.boulderId)}>
          <FieldLabel htmlFor={`${prefix}-boulder`}>
            {state.fields.boulderId.label}
          </FieldLabel>
          <NativeSelect
            id={`${prefix}-boulder`}
            name="boulderId"
            className="w-full"
            disabled={pending}
            defaultValue={state.fields.boulderId.value}
            aria-invalid={Boolean(state.errors.boulderId)}
          >
            <NativeSelectOption value="">Unassigned</NativeSelectOption>
            {boulders.map((boulder) => (
              <NativeSelectOption key={boulder.value} value={boulder.value}>
                {boulder.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError>{state.errors.boulderId}</FieldError>
        </Field>
        <Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating route..." : "Create route"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
