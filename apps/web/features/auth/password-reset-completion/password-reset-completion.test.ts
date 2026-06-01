import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createPasswordResetCompletionAction,
  passwordResetCompletionAction,
  redirectToLoginAfterPasswordReset,
  type PasswordResetCompletionActionDependencies,
  type PasswordResetCompletionInput,
} from "./password-reset-completion-action"
import {
  PasswordResetCompletionViewModel,
  type PasswordResetCompletionActionData,
} from "./password-reset-completion-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/password-reset/complete", {
    method: "POST",
    body,
  })

const createRedirectRecorder = () => {
  let calls = 0

  return {
    get calls() {
      return calls
    },
    redirectToLogin: () => {
      calls += 1
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/recorded-login",
        },
      })
    },
  }
}

const createAction = (
  completeGymUserPasswordReset: PasswordResetCompletionActionDependencies["completeGymUserPasswordReset"]
) => {
  const redirect = createRedirectRecorder()

  return {
    action: createPasswordResetCompletionAction({
      completeGymUserPasswordReset,
      redirectToLogin: redirect.redirectToLogin,
    }),
    redirect,
  }
}

describe("password reset completion view model", () => {
  it("prefills the token from query params", () => {
    expect(
      PasswordResetCompletionViewModel.initialToken(
        new URL("https://kryno.test/password-reset/complete?token= reset-1 ")
      )
    ).toBe("reset-1")
  })
})

describe("password reset completion action", () => {
  it("returns inline validation errors before calling the completion dependency", async () => {
    const completionCalls: PasswordResetCompletionInput[] = []
    const { action } = createAction((input) => {
      completionCalls.push(input)
      return Effect.void
    })

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          token: "",
          newPassword: "",
        })
      ),
    })) as PasswordResetCompletionActionData

    expect(completionCalls).toHaveLength(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      token: "Enter your reset token.",
      newPassword: "Enter a new password.",
    })
  })

  it("invalid input does not require the production API base URL", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      const result = (await passwordResetCompletionAction({
        request: actionRequest(new URLSearchParams({ token: "" })),
      })) as PasswordResetCompletionActionData

      expect(result.status).toBe("error")
      expect(result.fieldErrors?.token).toBe("Enter your reset token.")
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("requires the API base URL to be configured for valid production completions", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        passwordResetCompletionAction({
          request: actionRequest(
            new URLSearchParams({
              token: "gym-user-password-reset-token-1",
              newPassword: "correct horse battery staple",
            })
          ),
        })
      ).rejects.toThrow("KRYNO_API_BASE_URL must be configured")
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("passes normalized input to the completion dependency and redirects on success", async () => {
    const completionCalls: PasswordResetCompletionInput[] = []
    const { action, redirect } = createAction((input) => {
      completionCalls.push(input)
      return Effect.void
    })

    const response = (await action({
      request: actionRequest(
        new URLSearchParams({
          token: " gym-user-password-reset-token-1 ",
          newPassword: " correct horse battery staple ",
        })
      ),
    })) as Response

    expect(completionCalls).toEqual([
      {
        token: "gym-user-password-reset-token-1",
        newPassword: "correct horse battery staple",
      },
    ])
    expect(redirect.calls).toBe(1)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/recorded-login")
  })

  it.each([
    ["GymUserPasswordResetTokenInvalid", "invalid or expired"],
    ["GymUserPasswordResetTokenExpired", "expired"],
    ["GymUserPasswordResetTokenAlreadyUsed", "already been used"],
    ["GymUserNotFound", "invalid or expired"],
  ] as const)("returns %s failures as inline action data", async (tag, text) => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: tag,
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          token: "gym-user-password-reset-token-1",
          newPassword: "correct horse battery staple",
        })
      ),
    })) as PasswordResetCompletionActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toContain(text)
  })

  it("does not swallow unexpected completion failures", async () => {
    const unexpected = new Error("API server unavailable")
    const { action } = createAction(() => Effect.fail(unexpected))

    await expect(
      action({
        request: actionRequest(
          new URLSearchParams({
            token: "gym-user-password-reset-token-1",
            newPassword: "correct horse battery staple",
          })
        ),
      })
    ).rejects.toBe(unexpected)
  })

  it("redirects successful completion to gym-user login with status", () => {
    const response = redirectToLoginAfterPasswordReset()

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "/login?status=password-reset-complete"
    )
  })
})
