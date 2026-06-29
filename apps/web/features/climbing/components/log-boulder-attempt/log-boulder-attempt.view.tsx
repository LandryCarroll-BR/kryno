"use client"

import { useActionState } from "react"
import { Button } from "@packages/ui/components/button"

import {
  logBoulderAttemptInitialViewModel,
  outcomeOptions,
  type LogBoulderAttemptViewModel,
} from "@climbing/adapters-next/view-models/log-boulder-attempt"

type LogBoulderAttemptAction = (
  previousState: LogBoulderAttemptViewModel,
  formData: FormData
) => Promise<LogBoulderAttemptViewModel>

export function LogBoulderAttemptView({
  action,
  boulderId,
}: {
  action: LogBoulderAttemptAction
  boulderId: string
}) {
  const [state, formAction, pending] = useActionState(
    action,
    logBoulderAttemptInitialViewModel
  )

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {outcomeOptions.map((outcome) => (
          <form key={outcome.value} action={formAction}>
            <input type="hidden" name="boulderId" value={boulderId} />
            <input type="hidden" name="outcome" value={outcome.value} />
            <Button
              type="submit"
              size="sm"
              variant={outcome.value === "FELL" ? "outline" : "default"}
              disabled={pending}
            >
              {outcome.label}
            </Button>
          </form>
        ))}
      </div>
      {state.message !== "" && (
        <p
          className={
            state.status === "success"
              ? "text-sm text-muted-foreground"
              : "max-w-56 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
    </div>
  )
}
