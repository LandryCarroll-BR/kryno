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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import {
  createGymInitialViewModel,
  type CreateGymViewModel,
} from "@gym/adapters-next/view-models/create-gym"

type CreateGymAction = (
  previousState: CreateGymViewModel,
  formData: FormData
) => Promise<CreateGymViewModel>

export function CreateGymView({ action }: { action: CreateGymAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    createGymInitialViewModel
  )

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create gym</CardTitle>
        <CardDescription>
          Add a gym before defining its areas and routes.
        </CardDescription>
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
              <FieldLabel htmlFor="gym-name">
                {state.fields.name.label}
              </FieldLabel>
              <Input
                id="gym-name"
                name="name"
                placeholder="The Cliffs at Gowanus"
                disabled={pending}
                defaultValue={state.fields.name.value}
                aria-invalid={Boolean(state.errors.name)}
                aria-describedby={
                  state.errors.name ? "gym-name-error" : undefined
                }
              />
              <FieldError id="gym-name-error">{state.errors.name}</FieldError>
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating gym..." : "Create gym"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
