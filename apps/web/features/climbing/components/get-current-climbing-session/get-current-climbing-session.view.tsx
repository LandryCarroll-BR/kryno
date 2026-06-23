import { endClimbingSession } from "@/features/climbing/components/end-climbing-session/end-climbing-session.action"
import { EndClimbingSessionView } from "@/features/climbing/components/end-climbing-session/end-climbing-session.view"
import { getCurrentClimbingSession } from "@/features/climbing/components/get-current-climbing-session/get-current-climbing-session.query"
import { startClimbingSession } from "@/features/climbing/components/start-climbing-session/start-climbing-session.action"
import { StartClimbingSessionView } from "@/features/climbing/components/start-climbing-session/start-climbing-session.view"

export async function GetCurrentClimbingSessionView() {
  const currentClimbingSession = await getCurrentClimbingSession()

  return (
    <>
      {currentClimbingSession.status === "active" ? (
        <EndClimbingSessionView
          action={endClimbingSession}
          session={currentClimbingSession}
        />
      ) : (
        <StartClimbingSessionView action={startClimbingSession} />
      )}
    </>
  )
}
