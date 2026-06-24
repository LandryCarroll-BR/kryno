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
  type CreateBoulderViewModel,
} from "@climbing/adapters-next/view-models"

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
            {state.status === "success" && (
              <Alert>
                <AlertDescription>
                  Created {state.name} at {state.grade}.
                </AlertDescription>
              </Alert>
            )}

            {state.status === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(state.fieldErrors.name)}>
              <FieldLabel htmlFor="boulder-name">Name</FieldLabel>
              <Input
                id="boulder-name"
                name="name"
                placeholder="Blue Circuit 12"
                disabled={pending}
                defaultValue={state.fields.name.value}
                aria-invalid={Boolean(state.fieldErrors.name)}
                aria-describedby={
                  state.fieldErrors.name ? "boulder-name-error" : undefined
                }
              />
              <FieldError id="boulder-name-error">
                {state.fieldErrors.name}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors.grade)}>
              <FieldLabel htmlFor="boulder-grade">Grade</FieldLabel>
              <NativeSelect
                id="boulder-grade"
                name="grade"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.grade.value}
                aria-invalid={Boolean(state.fieldErrors.grade)}
                aria-describedby={
                  state.fieldErrors.grade ? "boulder-grade-error" : undefined
                }
              >
                {state.form.gradeOptions.map((grade) => (
                  <NativeSelectOption key={grade} value={grade}>
                    {grade}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-grade-error">
                {state.fieldErrors.grade}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors.wallAngle)}>
              <FieldLabel htmlFor="boulder-wall-angle">Wall angle</FieldLabel>
              <NativeSelect
                id="boulder-wall-angle"
                name="wallAngle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.wallAngle.value}
                aria-invalid={Boolean(state.fieldErrors.wallAngle)}
                aria-describedby={
                  state.fieldErrors.wallAngle
                    ? "boulder-wall-angle-error"
                    : undefined
                }
              >
                {state.form.wallAngleOptions.map((angle) => (
                  <NativeSelectOption key={angle.value} value={angle.value}>
                    {angle.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-wall-angle-error">
                {state.fieldErrors.wallAngle}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(state.fieldErrors.movementStyle)}>
              <FieldLabel htmlFor="boulder-movement-style">
                Movement style
              </FieldLabel>
              <NativeSelect
                id="boulder-movement-style"
                name="movementStyle"
                className="w-full"
                disabled={pending}
                defaultValue={state.fields.movementStyle.value}
                aria-invalid={Boolean(state.fieldErrors.movementStyle)}
                aria-describedby={
                  state.fieldErrors.movementStyle
                    ? "boulder-movement-style-error"
                    : undefined
                }
              >
                {state.form.movementStyleOptions.map((style) => (
                  <NativeSelectOption key={style.value} value={style.value}>
                    {style.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError id="boulder-movement-style-error">
                {state.fieldErrors.movementStyle}
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
