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
import { RadioGroup, RadioGroupItem } from "@packages/ui/components/radio-group"
import {
  boulderColorOptions,
  boulderGradeOptions,
  boulderMovementStyleOptions,
  boulderSourceOptions,
  boulderWallAngleOptions,
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
  areaName,
  nextOrder,
  boulders,
}: {
  action: CreateGymRouteAction
  gymId: string
  areaId: string
  areaName: string
  nextOrder: number
  boulders: readonly GymBoulderOptionViewModel[]
}) {
  const initialBoulderSource = boulders.length === 0 ? "new" : "existing"
  const [boulderSource, setBoulderSource] = useState<"existing" | "new">(
    initialBoulderSource
  )
  const [boulderGrade, setBoulderGrade] = useState(
    createGymRouteInitialViewModel.fields.boulderGrade.value
  )
  const [boulderColor, setBoulderColor] = useState(
    createGymRouteInitialViewModel.fields.boulderColor.value
  )
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
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
      order: {
        ...createGymRouteInitialViewModel.fields.order,
        value: String(nextOrder),
      },
      setOn: {
        ...createGymRouteInitialViewModel.fields.setOn,
        value: localToday(),
      },
      boulderSource: {
        ...createGymRouteInitialViewModel.fields.boulderSource,
        value: initialBoulderSource,
      },
    },
  })
  const prefix = `route-${areaId}`
  const usingExistingBoulder = boulderSource === "existing"
  const cannotSubmit =
    pending || (usingExistingBoulder && boulders.length === 0)
  const selectedColorLabel =
    boulderColorOptions.find(({ value }) => value === boulderColor)?.label ??
    "White"
  const derivedBoulderName = `${areaName} ${selectedColorLabel} ${boulderGrade}`

  useEffect(() => {
    return () => {
      if (imagePreviewUrl !== null) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  return (
    <form action={formAction} className="mt-6 border-t pt-6">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="areaId" value={areaId} />
      <input type="hidden" name="boulderSource" value={boulderSource} />
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
              defaultValue={state.fields.order.value || String(nextOrder)}
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
                file === undefined ? null : URL.createObjectURL(file)
              )
            }}
          />
          {imagePreviewUrl !== null && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="Route preview"
              className="h-40 w-full rounded-md border object-cover sm:w-64"
            />
          )}
          <FieldError>{state.errors.routeImage}</FieldError>
        </Field>
        <Field data-invalid={Boolean(state.errors.boulderSource)}>
          <FieldLabel>{state.fields.boulderSource.label}</FieldLabel>
          <RadioGroup
            className="grid gap-3 sm:grid-cols-2"
            value={boulderSource}
            onValueChange={(value) => {
              if (value === "existing" || value === "new") {
                setBoulderSource(value)
              }
            }}
            aria-invalid={Boolean(state.errors.boulderSource)}
          >
            {boulderSourceOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium"
              >
                <RadioGroupItem
                  value={option.value}
                  disabled={pending}
                  aria-label={option.label}
                />
                {option.label}
              </label>
            ))}
          </RadioGroup>
          <FieldError>{state.errors.boulderSource}</FieldError>
        </Field>
        {usingExistingBoulder ? (
          <Field data-invalid={Boolean(state.errors.boulderId)}>
            <FieldLabel htmlFor={`${prefix}-boulder`}>
              {state.fields.boulderId.label}
            </FieldLabel>
            <NativeSelect
              id={`${prefix}-boulder`}
              name="boulderId"
              className="w-full"
              disabled={pending || boulders.length === 0}
              defaultValue={state.fields.boulderId.value}
              aria-invalid={Boolean(state.errors.boulderId)}
            >
              <NativeSelectOption value="">
                {boulders.length === 0
                  ? "No unassigned boulders available"
                  : "Select a boulder"}
              </NativeSelectOption>
              {boulders.map((boulder) => (
                <NativeSelectOption key={boulder.value} value={boulder.value}>
                  {boulder.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError>{state.errors.boulderId}</FieldError>
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${prefix}-boulder-name`}>
                Boulder name
              </FieldLabel>
              <Input
                id={`${prefix}-boulder-name`}
                disabled
                value={derivedBoulderName}
              />
            </Field>
            <Field data-invalid={Boolean(state.errors.boulderGrade)}>
              <FieldLabel htmlFor={`${prefix}-boulder-grade`}>
                {state.fields.boulderGrade.label}
              </FieldLabel>
              <NativeSelect
                id={`${prefix}-boulder-grade`}
                name="boulderGrade"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.boulderGrade.value}
                onChange={(event) => setBoulderGrade(event.currentTarget.value)}
                aria-invalid={Boolean(state.errors.boulderGrade)}
              >
                {boulderGradeOptions.map((grade) => (
                  <NativeSelectOption key={grade.value} value={grade.value}>
                    {grade.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{state.errors.boulderGrade}</FieldError>
            </Field>
            <Field data-invalid={Boolean(state.errors.boulderColor)}>
              <FieldLabel htmlFor={`${prefix}-boulder-color`}>
                {state.fields.boulderColor.label}
              </FieldLabel>
              <NativeSelect
                id={`${prefix}-boulder-color`}
                name="boulderColor"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.boulderColor.value}
                onChange={(event) => setBoulderColor(event.currentTarget.value)}
                aria-invalid={Boolean(state.errors.boulderColor)}
              >
                {boulderColorOptions.map((color) => (
                  <NativeSelectOption key={color.value} value={color.value}>
                    {color.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{state.errors.boulderColor}</FieldError>
            </Field>
            <Field data-invalid={Boolean(state.errors.boulderWallAngle)}>
              <FieldLabel htmlFor={`${prefix}-boulder-wall-angle`}>
                {state.fields.boulderWallAngle.label}
              </FieldLabel>
              <NativeSelect
                id={`${prefix}-boulder-wall-angle`}
                name="boulderWallAngle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.boulderWallAngle.value}
                aria-invalid={Boolean(state.errors.boulderWallAngle)}
              >
                {boulderWallAngleOptions.map((angle) => (
                  <NativeSelectOption key={angle.value} value={angle.value}>
                    {angle.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{state.errors.boulderWallAngle}</FieldError>
            </Field>
            <Field data-invalid={Boolean(state.errors.boulderMovementStyle)}>
              <FieldLabel htmlFor={`${prefix}-boulder-movement-style`}>
                {state.fields.boulderMovementStyle.label}
              </FieldLabel>
              <NativeSelect
                id={`${prefix}-boulder-movement-style`}
                name="boulderMovementStyle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.boulderMovementStyle.value}
                aria-invalid={Boolean(state.errors.boulderMovementStyle)}
              >
                {boulderMovementStyleOptions.map((style) => (
                  <NativeSelectOption key={style.value} value={style.value}>
                    {style.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError>{state.errors.boulderMovementStyle}</FieldError>
            </Field>
          </div>
        )}
        <Field>
          <Button type="submit" disabled={cannotSubmit}>
            {pending ? "Creating route..." : "Create route"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
