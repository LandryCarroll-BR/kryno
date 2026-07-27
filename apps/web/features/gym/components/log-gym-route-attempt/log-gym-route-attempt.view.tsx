"use client"

import { useActionState } from "react"
import { Button } from "@packages/ui/components/button"

import {
  gymAttemptMoveTypeOptions,
  gymAttemptOutcomeOptions,
  logGymRouteAttemptInitialViewModel,
  type LogGymRouteAttemptViewModel,
} from "@gym/adapters-next/view-models/log-gym-route-attempt"

type LogGymRouteAttemptAction = (
  previousState: LogGymRouteAttemptViewModel,
  formData: FormData
) => Promise<LogGymRouteAttemptViewModel>

export function LogGymRouteAttemptView({
  action,
  gymId,
  routeId,
}: {
  action: LogGymRouteAttemptAction
  gymId: string
  routeId: string
}) {
  const [state, formAction, pending] = useActionState(
    action,
    logGymRouteAttemptInitialViewModel
  )

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input type="hidden" name="gymId" value={gymId} />
      <input type="hidden" name="routeId" value={routeId} />
      <div className="flex max-w-80 flex-wrap justify-end gap-1.5">
        {gymAttemptMoveTypeOptions.map((moveType) => (
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
        {gymAttemptOutcomeOptions.map((outcome) => (
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
              : "max-w-64 text-right text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
