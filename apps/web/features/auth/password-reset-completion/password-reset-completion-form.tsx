import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"
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

import type { PasswordResetCompletionAction } from "../../../features/auth/password-reset-completion/password-reset-completion-action"
import { PasswordResetCompletionViewModel } from "../../../features/auth/password-reset-completion/password-reset-completion-view-model"

export function PasswordResetCompletionForm() {
  const actionData = useActionData<PasswordResetCompletionAction>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const isSubmitting = navigation.state === "submitting"
  const initialToken = PasswordResetCompletionViewModel.initialToken(
    new URL(`https://kryno.local/?${searchParams.toString()}`)
  )

  return (
    <Form method="post" className="space-y-6">
      <FieldSet>
        <FieldGroup>
          {actionData?.formError && (
            <Alert variant="destructive">
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(actionData?.fieldErrors?.token)}>
            <FieldLabel htmlFor="token">Reset token</FieldLabel>
            <Input
              id="token"
              name="token"
              type="text"
              autoComplete="one-time-code"
              aria-invalid={Boolean(actionData?.fieldErrors?.token)}
              defaultValue={initialToken}
              required
            />
            <FieldError>{actionData?.fieldErrors?.token}</FieldError>
          </Field>

          <Field data-invalid={Boolean(actionData?.fieldErrors?.newPassword)}>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(actionData?.fieldErrors?.newPassword)}
              required
            />
            <FieldError>{actionData?.fieldErrors?.newPassword}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Resetting password" : "Reset password"}
          <RiArrowRightLine aria-hidden="true" />
        </Button>
        <Link to="/login" className={buttonVariants()}>
          <RiArrowLeftLine aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </Form>
  )
}
