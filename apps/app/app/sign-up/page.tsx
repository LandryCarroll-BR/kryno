import { signUp } from "@/components/sign-up/sign-up.action"
import { SignUpView } from "@/components/sign-up/sign-up.view"

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <SignUpView action={signUp} searchParams={searchParams} />
      </main>
    </div>
  )
}
