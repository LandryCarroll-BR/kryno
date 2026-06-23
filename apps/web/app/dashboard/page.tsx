import { CurrentUserView } from "@/features/auth/components/current-user/current-user.view"
import { signOut } from "@/features/auth/components/sign-out/sign-out.action"
import { SignOutView } from "@/features/auth/components/sign-out/sign-out.view"
import { createBoulder } from "@/features/climbing/components/create-boulder/create-boulder.action"
import { CreateBoulderView } from "@/features/climbing/components/create-boulder/create-boulder.view"
import { ListCreatedBouldersView } from "@/features/climbing/components/list-created-boulders/list-created-boulders.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"
import { GetCurrentClimbingSessionView } from "../../features/climbing/components/get-current-climbing-session/get-current-climbing-session.view"
import { Suspense } from "react"

async function Dashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="grid grid-cols-2 gap-8 p-24">
        <div className="flex items-center gap-4">
          <Suspense>
            <CurrentUserView />
            <SignOutView action={signOut} />
          </Suspense>
        </div>
        <Suspense>
          <GetCurrentClimbingSessionView />
        </Suspense>
        <CreateBoulderView action={createBoulder} />
        <Suspense>
          <ListCreatedBouldersView />
        </Suspense>
      </main>
    </div>
  )
}

export default withAuthentication(Dashboard)
