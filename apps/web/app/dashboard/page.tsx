import { Suspense } from "react"
import { GetCurrentUserView } from "@/features/auth/components/get-current-user/get-current-user.view"
import { signOut } from "@/features/auth/components/sign-out/sign-out.action"
import { SignOutView } from "@/features/auth/components/sign-out/sign-out.view"
import { createBoulder } from "@/features/climbing/components/create-boulder/create-boulder.action"
import { CreateBoulderView } from "@/features/climbing/components/create-boulder/create-boulder.view"
import { deleteBoulder } from "@/features/climbing/components/delete-boulder/delete-boulder.action"
import { ListCreatedBouldersView } from "@/features/climbing/components/list-created-boulders/list-created-boulders.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"
import { GetCurrentClimbingSessionView } from "@/features/climbing/components/get-current-climbing-session/get-current-climbing-session.view"
import { getCurrentUser } from "@/features/auth/components/get-current-user/get-current-user.query"
import { listCreatedBoulders } from "@/features/climbing/components/list-created-boulders/list-created-boulders.query"
import { getCurrentClimbingSession } from "@/features/climbing/components/get-current-climbing-session/get-current-climbing-session.query"
import { logBoulderAttempt } from "@/features/climbing/components/log-boulder-attempt/log-boulder-attempt.action"
import { startClimbingSession } from "@/features/climbing/components/start-climbing-session/start-climbing-session.action"
import { endClimbingSession } from "@/features/climbing/components/end-climbing-session/end-climbing-session.action"

async function Dashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="grid grid-cols-2 gap-8 p-24">
        <div className="flex items-center gap-4">
          <Suspense>
            <GetCurrentUserView query={getCurrentUser} />
            <SignOutView action={signOut} />
          </Suspense>
        </div>
        <Suspense>
          <GetCurrentClimbingSessionView
            query={getCurrentClimbingSession}
            startAction={startClimbingSession}
            endAction={endClimbingSession}
          />
        </Suspense>
        <CreateBoulderView action={createBoulder} />
        <Suspense>
          <ListCreatedBouldersView
            query={listCreatedBoulders}
            logAttemptAction={logBoulderAttempt}
            deleteAction={deleteBoulder}
          />
        </Suspense>
      </main>
    </div>
  )
}

export default withAuthentication(Dashboard)
