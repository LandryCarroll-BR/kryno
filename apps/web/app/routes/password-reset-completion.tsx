import { passwordResetCompletionAction } from "../../features/auth/password-reset-completion/password-reset-completion-action"
import { PasswordResetCompletionForm } from "../../features/auth/password-reset-completion/password-reset-completion-form"

export const action = passwordResetCompletionAction

export default function PasswordResetCompletion() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Choose a new password
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Enter your reset token and replacement password to recover your
                gym account.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-start lg:justify-self-end">
            <PasswordResetCompletionForm />
          </div>
        </div>
      </section>
    </main>
  )
}
