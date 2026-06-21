import { CurrentUserView } from "@/features/auth/components/current-user/current-user.view"
import { signOut } from "@/features/auth/components/sign-out/sign-out.action"
import { SignOutView } from "@/features/auth/components/sign-out/sign-out.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <div className="flex gap-4">
          <CurrentUserView />
          <SignOutView action={signOut} />
        </div>
      </main>
    </div>
  )
}

export default withAuthentication(Dashboard)
