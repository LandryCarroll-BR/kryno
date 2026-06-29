"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"

import {
  signOutInitialViewModel,
  type SignOutViewModel,
} from "@auth/adapters-next/view-models/sign-out"

type SignOutAction = (
  previousState: SignOutViewModel,
  formData: FormData
) => Promise<SignOutViewModel>

export function SignOutView({ action }: { action: SignOutAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    signOutInitialViewModel
  )

  return (
    <form action={formAction}>
      {state.message !== "" && (
        <Alert
          variant={state.status === "success" ? "default" : "destructive"}
          className="mb-4"
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing Out..." : "Sign Out"}
      </Button>
    </form>
  )
}
