import { passwordResetRequestAction } from "../../features/auth/password-reset-request/password-reset-request-action"
import { PasswordResetRequestForm } from "../../features/auth/password-reset-request/password-reset-request-form"

export const action = passwordResetRequestAction

export default function PasswordResetRequest() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Reset your password
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Enter your email and we will send reset instructions if the
                account exists.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-start lg:justify-self-end">
            <PasswordResetRequestForm />
          </div>
        </div>
      </section>
    </main>
  )
}
