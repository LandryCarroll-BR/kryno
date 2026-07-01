"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import {
  joinGymInitialViewModel,
  type JoinGymViewModel,
} from "@gym/adapters-next/view-models/join-gym"

type JoinGymAction = (
  previousState: JoinGymViewModel,
  formData: FormData
) => Promise<JoinGymViewModel>

export function JoinGymView({
  action,
  gymId,
  isMember,
}: {
  action: JoinGymAction
  gymId: string
  isMember: boolean
}) {
  const [state, formAction, pending] = useActionState(
    action,
    joinGymInitialViewModel
  )
  const joined =
    isMember || state.status === "success" || state.status === "already-member"

  return (
    <div className="flex flex-col items-end gap-2">
      {joined ? (
        <Badge variant="secondary">Joined</Badge>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="gymId" value={gymId} />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Joining…" : "Join gym"}
          </Button>
        </form>
      )}

      {state.message !== "" && (
        <Alert
          variant={
            state.status === "success" || state.status === "already-member"
              ? "default"
              : "destructive"
          }
          className="max-w-sm"
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
