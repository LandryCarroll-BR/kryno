"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import { Input } from "@packages/ui/components/input"

import {
  NativeSelect,
  NativeSelectOption,
} from "@packages/ui/components/native-select"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@packages/ui/components/field"

import {
  createBoulderInitialViewModel,
  gradeOptions,
  movementStyleOptions,
  type CreateBoulderViewModel,
  wallAngleOptions,
} from "@climbing/adapters-next/view-models/create-boulder"

type CreateBoulderAction = (
  previousState: CreateBoulderViewModel,
  formData: FormData
) => Promise<CreateBoulderViewModel>

export function CreateBoulderView({ action }: { action: CreateBoulderAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    createBoulderInitialViewModel
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create boulder</CardTitle>
        <CardDescription>Add a problem to climb later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {state.message !== "" && (
              <Alert
                variant={state.status === "success" ? "default" : "destructive"}
              >
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(state.errors.name)}>
              <FieldLabel htmlFor="boulder-name">
                {state.fields.name.label}
              </FieldLabel>
              <Input
                id="boulder-name"
                name="name"
                placeholder="Blue Circuit 12"
                disabled={pending}
                defaultValue={state.fields.name.value}
                aria-invalid={Boolean(state.errors.name)}
                aria-describedby={
                  state.errors.name ? "boulder-name-error" : undefined
                }
              />
              <FieldError id="boulder-name-error">
                {state.errors.name}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.grade)}>
              <FieldLabel htmlFor="boulder-grade">
                {state.fields.grade.label}
              </FieldLabel>
              <NativeSelect
                id="boulder-grade"
                name="grade"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.grade.value}
                aria-invalid={Boolean(state.errors.grade)}
                aria-describedby={
                  state.errors.grade ? "boulder-grade-error" : undefined
                }
              >
                {gradeOptions.map((grade) => (
                  <NativeSelectOption key={grade.value} value={grade.value}>
                    {grade.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-grade-error">
                {state.errors.grade}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.wallAngle)}>
              <FieldLabel htmlFor="boulder-wall-angle">
                {state.fields.wallAngle.label}
              </FieldLabel>
              <NativeSelect
                id="boulder-wall-angle"
                name="wallAngle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.wallAngle.value}
                aria-invalid={Boolean(state.errors.wallAngle)}
                aria-describedby={
                  state.errors.wallAngle
                    ? "boulder-wall-angle-error"
                    : undefined
                }
              >
                {wallAngleOptions.map((angle) => (
                  <NativeSelectOption key={angle.value} value={angle.value}>
                    {angle.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-wall-angle-error">
                {state.errors.wallAngle}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.errors.movementStyle)}>
              <FieldLabel htmlFor="boulder-movement-style">
                {state.fields.movementStyle.label}
              </FieldLabel>
              <NativeSelect
                id="boulder-movement-style"
                name="movementStyle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.movementStyle.value}
                aria-invalid={Boolean(state.errors.movementStyle)}
                aria-describedby={
                  state.errors.movementStyle
                    ? "boulder-movement-style-error"
                    : undefined
                }
              >
                {movementStyleOptions.map((style) => (
                  <NativeSelectOption key={style.value} value={style.value}>
                    {style.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-movement-style-error">
                {state.errors.movementStyle}
              </FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating boulder..." : "Create boulder"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
