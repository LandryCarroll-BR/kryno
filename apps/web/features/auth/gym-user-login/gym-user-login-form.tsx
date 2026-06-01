import { RiArrowRightLine } from "@remixicon/react"
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router"
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

import type { GymUserLoginAction } from "../../../features/auth/gym-user-login/gym-user-login-action"
import { LoginActionViewModel } from "../../../features/auth/gym-user-login/gym-user-login-view-model"

export function GymUserLoginForm() {
  const actionData = useActionData<GymUserLoginAction>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const isSubmitting = navigation.state === "submitting"
  const statusMessage = LoginActionViewModel.statusMessage(
    searchParams.get("status")
  )

  return (
    <Form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {statusMessage && (
            <Alert>
              <AlertDescription>{statusMessage.message}</AlertDescription>
            </Alert>
          )}

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

          <Field data-invalid={Boolean(actionData?.fieldErrors?.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(actionData?.fieldErrors?.password)}
              required
            />
            <FieldError>{actionData?.fieldErrors?.password}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in" : "Sign in"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
        <Link to="/signup" className={buttonVariants()}>
          Create account
        </Link>
        <Link to="/password-reset" className={buttonVariants()}>
          Forgot password
        </Link>
      </div>
    </Form>
  )
}
