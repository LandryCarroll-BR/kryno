import { signOut } from "@/components/sign-out/sign-out.action"
import { SignOutView } from "@/components/sign-out/sign-out.view"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        HOME <SignOutView action={signOut} />
      </main>
    </div>
  )
}
