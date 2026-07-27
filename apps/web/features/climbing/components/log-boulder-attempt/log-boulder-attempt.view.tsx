"use client"

import { useActionState } from "react"
import { Button } from "@packages/ui/components/button"

import {
  attemptMoveTypeOptions,
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
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="boulderId" value={boulderId} />
      <div className="flex max-w-80 flex-wrap gap-1.5">
        {attemptMoveTypeOptions.map((moveType) => (
          <label
            key={moveType.value}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors has-checked:border-primary has-checked:text-foreground has-disabled:cursor-not-allowed has-disabled:opacity-50"
          >
            <input
              type="checkbox"
              name="moveTypes"
              value={moveType.value}
              disabled={pending}
              className="size-3 accent-primary"
            />
            <span>{moveType.label}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {outcomeOptions.map((outcome) => (
            <Button
              key={outcome.value}
              type="submit"
              name="outcome"
              value={outcome.value}
              size="sm"
              variant={outcome.value === "FELL" ? "outline" : "default"}
              disabled={pending}
            >
              {outcome.label}
            </Button>
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
    </form>
  )
}
