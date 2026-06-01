import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createGymUserSignupAction,
  gymUserSignupAction,
  redirectToEmailVerification,
  type GymUserSignupActionDependencies,
  type GymUserSignupInput,
} from "./gym-user-signup-action"
import type { SignupActionData } from "./gym-user-signup-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/signup", {
    method: "POST",
    body,
  })

const createRedirectRecorder = () => {
  const calls: string[] = []

  return {
    calls,
    redirectToEmailVerification: (email: string) => {
      calls.push(email)
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/recorded-verify-email",
        },
      })
    },
  }
}

const createAction = (
  signUpGymUser: GymUserSignupActionDependencies["signUpGymUser"]
) => {
  const redirect = createRedirectRecorder()

  return {
    action: createGymUserSignupAction({
      signUpGymUser,
      redirectToEmailVerification: redirect.redirectToEmailVerification,
    }),
    redirectCalls: redirect.calls,
  }
}

describe("gym-user signup action", () => {
  it("returns inline validation errors before calling the signup dependency", async () => {
    const signupCalls: GymUserSignupInput[] = []
    const { action } = createAction((input) => {
      signupCalls.push(input)
      return Effect.void
    })

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "not-an-email",
          password: "short",
          displayName: "",
        })
      ),
    })) as SignupActionData

    expect(signupCalls).toHaveLength(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      email: "Enter a valid email.",
      password: "Use at least 8 characters.",
      displayName: "Enter your display name.",
    })
  })

  it("invalid input does not require the production API base URL", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      const result = (await gymUserSignupAction({
        request: actionRequest(
          new URLSearchParams({
            email: "not-an-email",
            password: "short",
            displayName: "",
          })
        ),
      })) as SignupActionData

      expect(result.status).toBe("error")
      expect(result.fieldErrors).toEqual({
        email: "Enter a valid email.",
        password: "Use at least 8 characters.",
        displayName: "Enter your display name.",
      })
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("requires the API base URL to be configured for valid production signups", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        gymUserSignupAction({
          request: actionRequest(
            new URLSearchParams({
              email: "new@test.dev",
              password: "correct horse battery staple",
              displayName: "New User",
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

  it("passes normalized input to the signup dependency and redirects on success", async () => {
    const signupCalls: GymUserSignupInput[] = []
    const { action, redirectCalls } = createAction((input) => {
      signupCalls.push(input)
      return Effect.void
    })

    const response = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "NEW@TEST.DEV",
          password: "correct horse battery staple",
          displayName: "New User",
        })
      ),
    })) as Response

    expect(signupCalls).toEqual([
      {
        email: "new@test.dev",
        password: "correct horse battery staple",
        displayName: "New User",
      },
    ])
    expect(redirectCalls).toEqual(["new@test.dev"])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/recorded-verify-email")
  })

  it("returns duplicate email failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "GymUserEmailAlreadyReserved",
        email: "taken@test.dev",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "taken@test.dev",
          password: "correct horse battery staple",
          displayName: "Taken",
        })
      ),
    })) as SignupActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.email).toContain("already reserved")
  })

  it("does not swallow unexpected signup failures", async () => {
    const unexpected = new Error("API server unavailable")
    const { action } = createAction(() => Effect.fail(unexpected))

    await expect(
      action({
        request: actionRequest(
          new URLSearchParams({
            email: "new@test.dev",
            password: "correct horse battery staple",
            displayName: "New User",
          })
        ),
      })
    ).rejects.toBe(unexpected)
  })

  it("redirects successful signups to manual email verification", () => {
    const response = redirectToEmailVerification("new@test.dev")

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "/verify-email?email=new%40test.dev"
    )
  })
})
