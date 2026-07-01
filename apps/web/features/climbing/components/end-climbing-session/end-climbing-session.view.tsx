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
  endClimbingSessionInitialViewModel,
  type EndClimbingSessionViewModel,
} from "@climbing/adapters-next/view-models/end-climbing-session"
import type { GetCurrentClimbingSessionViewModel } from "@climbing/adapters-next/view-models/get-current-climbing-session"

type EndClimbingSessionAction = (
  previousState: EndClimbingSessionViewModel,
  formData: FormData
) => Promise<EndClimbingSessionViewModel>

export function EndClimbingSessionView({
  action,
  session,
}: {
  action: EndClimbingSessionAction
  session: GetCurrentClimbingSessionViewModel
}) {
  const [state, formAction, pending] = useActionState(
    action,
    endClimbingSessionInitialViewModel
  )

  if (state.status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session ended</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {state.fields.endedAt.label}{" "}
            {formatDate(state.fields.endedAt.value)}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active session</CardTitle>
        <CardDescription>{session.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {session.fields.startedAt.label}{" "}
          {formatDate(session.fields.startedAt.value)}
        </p>
        <form action={formAction}>
          {state.message !== "" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{state.message}</AlertDescription>
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

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
