import { withAuthentication } from "@/features/auth/utils/with-authentication"
import { endClimbingSession } from "@/features/climbing/components/end-climbing-session/end-climbing-session.action"
import { getCurrentClimbingSession } from "@/features/climbing/components/get-current-climbing-session/get-current-climbing-session.query"
import { startClimbingSession } from "@/features/climbing/components/start-climbing-session/start-climbing-session.action"
import { getGymRoutes } from "@/features/gym/components/get-gym-routes/get-gym-routes.query"
import { GetGymRoutesView } from "@/features/gym/components/get-gym-routes/get-gym-routes.view"
import { joinGym } from "@/features/gym/components/join-gym/join-gym.action"
import { logGymRouteAttempt } from "@/features/gym/components/log-gym-route-attempt/log-gym-route-attempt.action"

async function GymPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  return (
    <main className="min-h-screen bg-zinc-50 p-8 font-sans dark:bg-black">
      <GetGymRoutesView
        gymId={gymId}
        query={getGymRoutes}
        joinAction={joinGym}
        currentSessionQuery={getCurrentClimbingSession}
        startSessionAction={startClimbingSession}
        endSessionAction={endClimbingSession}
        logAttemptAction={logGymRouteAttempt}
      />
    </main>
  )
}

export default withAuthentication(GymPage)
