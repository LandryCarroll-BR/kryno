"use client"

import { use, useActionState } from "react"
import styles from "./sign-up.module.css"
import { SignUpViewModel } from "@auth/adapters-next"

const initialState = {
  status: "idle",
  fields: {
    username: { value: "" },
    email: { value: "" },
    password: { value: "" },
    confirmPassword: { value: "" },
  },
} as const

export function SignUpView({
  action,
  searchParams,
}: {
  action: (
    redirectUrl: string | undefined,
    previousState: SignUpViewModel,
    formData: FormData
  ) => Promise<SignUpViewModel>
  searchParams?: Promise<{ from?: string }>
}) {
  const params = searchParams && use(searchParams)
  const signUp = action.bind(null, params?.from) // Ensure the action is updated if searchParams change
  const [state, formAction, pending] = useActionState(signUp, initialState)

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.header}>
        <div className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15.25a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5.75 20c.83-2.76 3.17-4.25 6.25-4.25s5.42 1.49 6.25 4.25"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>
            Join Kryno and start building something great.
          </p>
        </div>
      </div>

      {state.error && (
        <p role="alert" className={styles.formError}>
          {state.error}
        </p>
      )}

      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            defaultValue={state.fields.username.value}
            aria-invalid={Boolean(state.fields.username.error)}
            aria-describedby={
              state.fields.username.error ? "username-error" : undefined
            }
            className={styles.input}
            placeholder="yourname"
          />
          {state.fields.username.error && (
            <p id="username-error" className={styles.fieldError}>
              {state.fields.username.error}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.fields.email.value}
            aria-invalid={Boolean(state.fields.email.error)}
            aria-describedby={
              state.fields.email.error ? "email-error" : undefined
            }
            className={styles.input}
            placeholder="you@example.com"
          />
          {state.fields.email.error && (
            <p id="email-error" className={styles.fieldError}>
              {state.fields.email.error}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(state.fields.password.error)}
            aria-describedby={
              state.fields.password.error ? "password-error" : undefined
            }
            className={styles.input}
            placeholder="At least 8 characters"
          />
          {state.fields.password.error && (
            <p id="password-error" className={styles.fieldError}>
              {state.fields.password.error}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(state.fields.confirmPassword.error)}
            aria-describedby={
              state.fields.confirmPassword.error
                ? "confirm-password-error"
                : undefined
            }
            className={styles.input}
            placeholder="Re-enter your password"
          />
          {state.fields.confirmPassword.error && (
            <p id="confirm-password-error" className={styles.fieldError}>
              {state.fields.confirmPassword.error}
            </p>
          )}
        </div>
      </div>

      <button disabled={pending} className={styles.button}>
        {pending ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Creating account…
          </>
        ) : (
          <>
            Sign up
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className={styles.arrow}
              aria-hidden="true"
            >
              <path
                d="M4.5 10h11m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </>
        )}
      </button>

      <p className={styles.terms}>
        By creating an account, you agree to our <a href="/terms">Terms</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>
    </form>
  )
}
