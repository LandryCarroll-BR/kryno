import { RiArrowRightLine } from "@remixicon/react"
import { Form, Link, useActionData, useNavigation } from "react-router"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import type { GymUserSignupAction } from "../../../features/auth/gym-user-signup/gym-user-signup-action"

export function GymUserSignupForm() {
  const actionData = useActionData<GymUserSignupAction>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <Form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {actionData?.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(actionData?.fieldErrors?.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(actionData?.fieldErrors?.email)}
              required
            />
            <FieldError>{actionData?.fieldErrors?.email}</FieldError>
          </Field>

          <Field data-invalid={Boolean(actionData?.fieldErrors?.displayName)}>
            <FieldLabel htmlFor="displayName">Display name</FieldLabel>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.displayName)}
              required
            />
            <FieldError>{actionData?.fieldErrors?.displayName}</FieldError>
          </Field>

          <Field data-invalid={Boolean(actionData?.fieldErrors?.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(actionData?.fieldErrors?.password)}
              required
              minLength={8}
            />
            <FieldError>{actionData?.fieldErrors?.password}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account" : "Create account"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
        <Link to="/" className={buttonVariants()}>
          Back
        </Link>
      </div>
    </Form>
  )
}
