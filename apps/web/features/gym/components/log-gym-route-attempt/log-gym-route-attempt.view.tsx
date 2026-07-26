"use client"

import { useActionState } from "react"
import { Button } from "@packages/ui/components/button"

import {
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
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        {gymAttemptOutcomeOptions.map((outcome) => (
          <form key={outcome.value} action={formAction}>
            <input type="hidden" name="gymId" value={gymId} />
            <input type="hidden" name="routeId" value={routeId} />
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
              : "max-w-64 text-right text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      )}
    </div>
  )
}
