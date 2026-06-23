import { CurrentUserView } from "@/features/auth/components/current-user/current-user.view"
import { signOut } from "@/features/auth/components/sign-out/sign-out.action"
import { SignOutView } from "@/features/auth/components/sign-out/sign-out.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"
import { startClimbingSession } from "@/features/climbing/components/start-climbing-session/start-climbing-session.action"
import { StartClimbingSessionView } from "@/features/climbing/components/start-climbing-session/start-climbing-session.view"

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
          <CurrentUserView />
          <SignOutView action={signOut} />
        </div>
        <StartClimbingSessionView action={startClimbingSession} />
      </main>
    </div>
  )
}

export default withAuthentication(Dashboard)
