import { signIn } from "@/features/auth/components/sign-in/sign-in.action"
import { SignInView } from "@/features/auth/components/sign-in/sign-in.view"

export default function SignIn() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <SignInView action={signIn} />
      </main>
    </div>
  )
}
