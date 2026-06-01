import { manualEmailVerificationAction } from "../../features/auth/manual-email-verification/manual-email-verification-action"
import { ManualEmailVerificationForm } from "../../features/auth/manual-email-verification/manual-email-verification-form"

export const action = manualEmailVerificationAction

export default function ManualEmailVerification() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Verify your email
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Enter the development verification token to activate your gym
                account.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-start lg:justify-self-end">
            <ManualEmailVerificationForm />
          </div>
        </div>
      </section>
    </main>
  )
}
