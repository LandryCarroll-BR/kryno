import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createManualEmailVerificationAction,
  manualEmailVerificationAction,
  redirectToLogin,
  type ManualEmailVerificationActionDependencies,
  type ManualEmailVerificationInput,
} from "./manual-email-verification-action"
import type { ManualEmailVerificationActionData } from "./manual-email-verification-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/verify-email", {
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
  verifyGymUserEmail: ManualEmailVerificationActionDependencies["verifyGymUserEmail"]
) => {
  const redirect = createRedirectRecorder()

  return {
    action: createManualEmailVerificationAction({
      verifyGymUserEmail,
      redirectToLogin: redirect.redirectToLogin,
    }),
    redirect,
  }
}

describe("manual email verification action", () => {
  it("returns inline validation errors before calling the verification dependency", async () => {
    const verificationCalls: ManualEmailVerificationInput[] = []
    const { action } = createAction((input) => {
      verificationCalls.push(input)
      return Effect.void
    })

    const result = (await action({
      request: actionRequest(new URLSearchParams({ token: "" })),
    })) as ManualEmailVerificationActionData

    expect(verificationCalls).toHaveLength(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      token: "Enter your verification token.",
    })
  })

  it("invalid input does not require the production API base URL", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      const result = (await manualEmailVerificationAction({
        request: actionRequest(new URLSearchParams({ token: "" })),
      })) as ManualEmailVerificationActionData

      expect(result.status).toBe("error")
      expect(result.fieldErrors).toEqual({
        token: "Enter your verification token.",
      })
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("requires the API base URL to be configured for valid production verification", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        manualEmailVerificationAction({
          request: actionRequest(
            new URLSearchParams({
              token: "gym-user-email-verification-token-1",
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

  it("passes normalized input to the verification dependency and redirects on success", async () => {
    const verificationCalls: ManualEmailVerificationInput[] = []
    const { action, redirect } = createAction((input) => {
      verificationCalls.push(input)
      return Effect.void
    })

    const response = (await action({
      request: actionRequest(
        new URLSearchParams({
          token: " gym-user-email-verification-token-1 ",
        })
      ),
    })) as Response

    expect(verificationCalls).toEqual([
      { token: "gym-user-email-verification-token-1" },
    ])
    expect(redirect.calls).toBe(1)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/recorded-login")
  })

  it("returns invalid verification token failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "GymUserEmailVerificationInvalid",
        token: "missing",
      } as const)
    )

    const result = (await action({
      request: actionRequest(new URLSearchParams({ token: "missing-token" })),
    })) as ManualEmailVerificationActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toContain("invalid or expired")
  })

  it("returns missing user failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "GymUserNotFound",
        userId: "gym-user-1",
      } as const)
    )

    const result = (await action({
      request: actionRequest(new URLSearchParams({ token: "missing-token" })),
    })) as ManualEmailVerificationActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toContain("invalid or expired")
  })

  it("does not swallow unexpected verification failures", async () => {
    const unexpected = new Error("API server unavailable")
    const { action } = createAction(() => Effect.fail(unexpected))

    await expect(
      action({
        request: actionRequest(
          new URLSearchParams({
            token: "gym-user-email-verification-token-1",
          })
        ),
      })
    ).rejects.toBe(unexpected)
  })

  it("redirects successful verification to gym-user login", () => {
    const response = redirectToLogin()

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
  })
})
