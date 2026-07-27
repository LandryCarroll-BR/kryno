"use client"

import { useActionState, useEffect, useState } from "react"
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
  editGymRouteInitialViewModel,
  type EditGymRouteViewModel,
} from "@gym/adapters-next/view-models"
import type {
  ManagedGymAreaViewModel,
  ManagedGymRouteViewModel,
} from "@gym/adapters-next/view-models/get-gym-management"

type EditGymRouteAction = (
  previousState: EditGymRouteViewModel,
  formData: FormData
) => Promise<EditGymRouteViewModel>

export function EditGymRouteView({
  action,
  gymId,
  route,
  areas,
}: {
  action: EditGymRouteAction
  gymId: string
  route: ManagedGymRouteViewModel
  areas: readonly ManagedGymAreaViewModel[]
}) {
  const [open, setOpen] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(action, {
    ...editGymRouteInitialViewModel,
    fields: {
      ...editGymRouteInitialViewModel.fields,
      gymId: {
        ...editGymRouteInitialViewModel.fields.gymId,
        value: gymId,
      },
      routeId: {
        ...editGymRouteInitialViewModel.fields.routeId,
        value: route.id,
      },
      areaId: {
        ...editGymRouteInitialViewModel.fields.areaId,
        value:
          areas.find((area) =>
            area.routes.some((candidate) => candidate.id === route.id)
          )?.id ?? "",
      },
      order: {
        ...editGymRouteInitialViewModel.fields.order,
        value: String(route.order),
      },
      positionLabel: {
        ...editGymRouteInitialViewModel.fields.positionLabel,
        value: route.positionLabel ?? "",
      },
      setOn: {
        ...editGymRouteInitialViewModel.fields.setOn,
        value: route.setOn,
      },
      setterName: {
        ...editGymRouteInitialViewModel.fields.setterName,
        value: route.setterName ?? "",
      },
    },
  })
  const prefix = `edit-route-${route.id}`

  useEffect(() => {
    return () => {
      if (imagePreviewUrl !== null) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  return (
    <>
      <Button
        type="button"
        size="xs"
        variant="outline"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Close edit" : "Edit"}
      </Button>
      {open && (
        <form
          action={formAction}
          className="mt-4 basis-full rounded-md border bg-background p-4"
        >
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="routeId" value={route.id} />
          <FieldGroup>
            {state.message !== "" && (
              <Alert
                variant={
                  state.status === "success" ? "default" : "destructive"
                }
              >
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state.errors.areaId)}>
                <FieldLabel htmlFor={`${prefix}-area`}>
                  {state.fields.areaId.label}
                </FieldLabel>
                <NativeSelect
                  id={`${prefix}-area`}
                  name="areaId"
                  className="w-full"
                  disabled={pending}
                  defaultValue={state.fields.areaId.value}
                  aria-invalid={Boolean(state.errors.areaId)}
                >
                  {areas.map((area) => (
                    <NativeSelectOption key={area.id} value={area.id}>
                      {area.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{state.errors.areaId}</FieldError>
              </Field>
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
                  disabled={pending}
                  defaultValue={state.fields.setterName.value}
                  aria-invalid={Boolean(state.errors.setterName)}
                />
                <FieldError>{state.errors.setterName}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state.errors.routeImage)}>
                <FieldLabel htmlFor={`${prefix}-route-image`}>
                  {state.fields.routeImage.label}
                </FieldLabel>
                <Input
                  id={`${prefix}-route-image`}
                  name="routeImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={pending}
                  aria-invalid={Boolean(state.errors.routeImage)}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    setImagePreviewUrl(
                      file === undefined
                        ? null
                        : URL.createObjectURL(file)
                    )
                  }}
                />
                {imagePreviewUrl !== null && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreviewUrl}
                    alt="Route preview"
                    className="h-32 w-full rounded-md border object-cover"
                  />
                )}
                <FieldError>{state.errors.routeImage}</FieldError>
              </Field>
            </div>
            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save route"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </>
  )
}
