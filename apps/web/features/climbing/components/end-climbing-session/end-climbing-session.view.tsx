"use client"

import { useActionState } from "react"
import type { EndClimbingSessionViewModel } from "@climbing/adapters-next"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

const initialState: EndClimbingSessionViewModel = {
  status: "idle",
}

export function EndClimbingSessionView({
  action,
}: {
  action: (
    previousState: EndClimbingSessionViewModel,
    formData: FormData
  ) => Promise<EndClimbingSessionViewModel>
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  if (state.status === "ended") {
    return (
      <Card className="w-[min(28rem,calc(100vw-2rem))]">
        <CardHeader>
          <CardTitle>Session ended</CardTitle>
          <CardDescription>Your climbing session has ended.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ended at{" "}
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(state.endedAt))}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[min(28rem,calc(100vw-2rem))]">
      <CardHeader>
        <CardTitle>Done climbing?</CardTitle>
        <CardDescription>
          End your active session when you leave the gym.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          {state.status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending} variant="secondary">
            {pending ? "Ending session..." : "End climbing session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
