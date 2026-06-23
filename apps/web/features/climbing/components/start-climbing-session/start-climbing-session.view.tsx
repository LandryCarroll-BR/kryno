"use client"

import { useActionState } from "react"
import type { StartClimbingSessionViewModel } from "@climbing/adapters-next"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

const initialState: StartClimbingSessionViewModel = {
  status: "idle",
}

export function StartClimbingSessionView({
  action,
}: {
  action: (
    previousState: StartClimbingSessionViewModel,
    formData: FormData
  ) => Promise<StartClimbingSessionViewModel>
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  if (state.status === "success") {
    return (
      <Card className="w-[min(28rem,calc(100vw-2rem))]">
        <CardHeader>
          <CardTitle>Session started</CardTitle>
          <CardDescription>Your climbing session is active.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Started at{" "}
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(state.startedAt))}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ready to climb?</CardTitle>
        <CardDescription>
          Start a session to begin tracking your climbing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          {state.status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Starting session…" : "Start climbing session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
