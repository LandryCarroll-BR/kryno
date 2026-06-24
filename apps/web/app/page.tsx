import { signOut } from "@/features/auth/components/sign-out/sign-out.action"
import { SignOutView } from "@/features/auth/components/sign-out/sign-out.view"
import { GetCurrentUserView } from "@/features/auth/components/get-current-user/get-current-user.view"
import { getCurrentUser } from "@/features/auth/components/get-current-user/get-current-user.query"

export default async function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <div className="flex gap-4">
          <GetCurrentUserView query={getCurrentUser} />
          <SignOutView action={signOut} />
        </div>
      </main>
    </div>
  )
}
