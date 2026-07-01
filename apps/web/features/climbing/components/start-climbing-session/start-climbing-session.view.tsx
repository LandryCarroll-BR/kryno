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
  startClimbingSessionInitialViewModel,
  type StartClimbingSessionViewModel,
} from "@climbing/adapters-next/view-models/start-climbing-session"

type StartClimbingSessionAction = (
  previousState: StartClimbingSessionViewModel,
  formData: FormData
) => Promise<StartClimbingSessionViewModel>

export function StartClimbingSessionView({
  action,
}: {
  action: StartClimbingSessionAction
}) {
  const [state, formAction, pending] = useActionState(
    action,
    startClimbingSessionInitialViewModel
  )

  if (state.status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session started</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {state.fields.startedAt.label}{" "}
            {formatDate(state.fields.startedAt.value)}
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
          {state.message !== "" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{state.message}</AlertDescription>
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

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
