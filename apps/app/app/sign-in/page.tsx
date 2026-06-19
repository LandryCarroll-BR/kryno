import { signIn } from "@/components/sign-in/sign-in.action"
import { SignInView } from "@/components/sign-in/sign-in.view"

export default async function SignIn({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <SignInView action={signIn} searchParams={searchParams} />
      </main>
    </div>
  )
}
