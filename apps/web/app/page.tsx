import { signOut } from "@/components/sign-out/sign-out.action"
import { SignOutView } from "@/components/sign-out/sign-out.view"
import { getCurrentUser } from "@/components/current-user/current-user.query"

export default async function Home() {
  const currentUser = await getCurrentUser()

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        HOME
        {currentUser ? (
          <>
            <p>{currentUser.username}</p>
            <p>{currentUser.email}</p>
            <SignOutView action={signOut} />
          </>
        ) : (
          <p>Not signed in</p>
        )}
      </main>
    </div>
  )
}
