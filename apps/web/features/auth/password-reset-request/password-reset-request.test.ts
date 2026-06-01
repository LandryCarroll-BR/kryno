import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createPasswordResetRequestAction,
  passwordResetRequestAction,
  type PasswordResetRequestActionDependencies,
  type PasswordResetRequestInput,
} from "./password-reset-request-action"
import type { PasswordResetRequestActionData } from "./password-reset-request-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/password-reset", {
    method: "POST",
    body,
  })

const createAction = (
  requestGymUserPasswordReset: PasswordResetRequestActionDependencies["requestGymUserPasswordReset"]
) =>
  createPasswordResetRequestAction({
    requestGymUserPasswordReset,
  })

describe("password reset request action", () => {
  it("returns inline validation errors before calling the password reset dependency", async () => {
    const resetCalls: PasswordResetRequestInput[] = []
    const action = createAction((input) => {
      resetCalls.push(input)
      return Effect.void
    })

    const result = (await action({
      request: actionRequest(new URLSearchParams({ email: "not-an-email" })),
    })) as PasswordResetRequestActionData

    expect(resetCalls).toHaveLength(0)
    expect(result.status).toBe("error")
    if (result.status === "error") {
      expect(result.fieldErrors).toEqual({
        email: "Enter a valid email.",
      })
    }
  })

  it("invalid input does not require the production API base URL", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      const result = (await passwordResetRequestAction({
        request: actionRequest(new URLSearchParams({ email: "not-an-email" })),
      })) as PasswordResetRequestActionData

      expect(result.status).toBe("error")
      if (result.status === "error") {
        expect(result.fieldErrors).toEqual({
          email: "Enter a valid email.",
        })
      }
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("requires the API base URL to be configured for valid production requests", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        passwordResetRequestAction({
          request: actionRequest(
            new URLSearchParams({ email: "member@test.dev" })
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

  it("passes normalized input to the password reset dependency and returns a privacy-preserving confirmation", async () => {
    const resetCalls: PasswordResetRequestInput[] = []
    const action = createAction((input) => {
      resetCalls.push(input)
      return Effect.void
    })

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({ email: " MEMBER@TEST.DEV " })
      ),
    })) as PasswordResetRequestActionData

    expect(resetCalls).toEqual([{ email: "member@test.dev" }])
    expect(result.status).toBe("success")
    if (result.status === "success") {
      expect(result.message).toContain("If an account exists")
    }
  })

  it("returns unknown-email failures as the same privacy-preserving confirmation", async () => {
    const action = createAction(() =>
      Effect.fail({
        _tag: "GymUserPasswordResetUnknownEmail",
        email: "missing@test.dev",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({ email: "missing@test.dev" })
      ),
    })) as PasswordResetRequestActionData

    expect(result.status).toBe("success")
    if (result.status === "success") {
      expect(result.message).toContain("If an account exists")
    }
  })

  it("does not swallow unexpected password reset failures", async () => {
    const unexpected = new Error("API server unavailable")
    const action = createAction(() => Effect.fail(unexpected))

    await expect(
      action({
        request: actionRequest(
          new URLSearchParams({ email: "member@test.dev" })
        ),
      })
    ).rejects.toBe(unexpected)
  })
})
