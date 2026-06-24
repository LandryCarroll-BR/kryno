"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"

import type {
  EndClimbingSessionViewModel,
  GetCurrentClimbingSessionViewModel,
} from "@climbing/adapters-next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import { endClimbingSession } from "./end-climbing-session.action"

export function EndClimbingSessionView({
  action,
  session,
}: {
  action: typeof endClimbingSession
  session: GetCurrentClimbingSessionViewModel
}) {
  const [state, formAction, pending] = useActionState(
    action,
    session?.status === "active"
      ? {
          status: "active",
          sessionId: session.sessionId,
          startedAt: session.startedAt,
        }
      : {
          status: "idle",
        }
  )

  if (state.status === "ended") {
    return (
      <Card>
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

  if (state.status === "active") {
    return (
      <Card className="w-[min(28rem,calc(100vw-2rem))]">
        <CardHeader>
          <CardTitle>Active session</CardTitle>
          <CardDescription>
            Your climbing session is in progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Started at{" "}
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(state.startedAt))}
          </p>
          <form action={formAction}>
            <Button type="submit" disabled={pending} variant="secondary">
              {pending ? "Ending session..." : "End climbing session"}
            </Button>
          </form>
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
