import { Alert, AlertDescription } from "@packages/ui/components/alert"

import type { EndClimbingSessionViewModel } from "@climbing/adapters-next/view-models/end-climbing-session"
import type { GetCurrentClimbingSessionViewModel } from "@climbing/adapters-next/view-models/get-current-climbing-session"
import type { StartClimbingSessionViewModel } from "@climbing/adapters-next/view-models/start-climbing-session"

import { EndClimbingSessionView } from "../end-climbing-session/end-climbing-session.view"
import { StartClimbingSessionView } from "../start-climbing-session/start-climbing-session.view"

type GetCurrentClimbingSessionQuery = () => Promise<GetCurrentClimbingSessionViewModel>

type StartClimbingSessionAction = (
  previousState: StartClimbingSessionViewModel,
  formData: FormData
) => Promise<StartClimbingSessionViewModel>

type EndClimbingSessionAction = (
  previousState: EndClimbingSessionViewModel,
  formData: FormData
) => Promise<EndClimbingSessionViewModel>

export async function GetCurrentClimbingSessionView({
  query,
  startAction,
  endAction,
}: {
  query: GetCurrentClimbingSessionQuery
  startAction: StartClimbingSessionAction
  endAction: EndClimbingSessionAction
}) {
  const currentClimbingSession = await query()

  if (
    currentClimbingSession.status === "invalid" ||
    currentClimbingSession.status === "error"
  ) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{currentClimbingSession.message}</AlertDescription>
      </Alert>
    )
  }

  return currentClimbingSession.status === "success" ? (
    <EndClimbingSessionView
      action={endAction}
      session={currentClimbingSession}
    />
  ) : (
    <StartClimbingSessionView action={startAction} />
  )
}
