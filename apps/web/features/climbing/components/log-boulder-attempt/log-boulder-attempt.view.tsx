"use client"

import { useActionState } from "react"
import { Button } from "@packages/ui/components/button"
import { logBoulderAttempt } from "@/features/climbing/components/log-boulder-attempt/log-boulder-attempt.action"

export function LogBoulderAttemptView({
  action,
  boulderId,
}: {
  action: typeof logBoulderAttempt
  boulderId: string
}) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  })

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={formAction}>
          <input type="hidden" name="boulderId" value={boulderId} />
          <input type="hidden" name="outcome" value="FELL" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            Fell
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="boulderId" value={boulderId} />
          <input type="hidden" name="outcome" value="TOPPED" />
          <Button type="submit" size="sm" disabled={pending}>
            Topped
          </Button>
        </form>
      </div>
      {state.status === "success" && (
        <p className="text-sm text-muted-foreground">
          Logged attempt {state.ordinal}.
        </p>
      )}
      {state.status === "error" && (
        <p className="max-w-56 text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}
