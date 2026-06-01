import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createGymUserLoginAction,
  gymUserLoginAction,
  redirectToAppWithSessionCookie,
  type GymUserLoginActionDependencies,
  type GymUserLoginInput,
} from "./gym-user-login-action"
import {
  LoginActionViewModel,
  type LoginActionData,
} from "./gym-user-login-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/login", {
    method: "POST",
    body,
  })

const localActionRequest = (body: URLSearchParams) =>
  new Request("http://localhost:5173/login", {
    method: "POST",
    body,
  })

const loginSuccess = {
  user: {
    id: "gym-user-1",
    email: "member@test.dev",
    displayName: "Member Test",
    emailVerified: true,
  },
  session: {
    id: "gym-user-session-1",
    userId: "gym-user-1",
    active: true,
  },
}

const createRedirectRecorder = () => {
  const calls: Array<{
    readonly sessionId: string
    readonly request: Request
  }> = []

  return {
    calls,
    redirectToAppWithSessionCookie: (sessionId: string, request: Request) => {
      calls.push({ sessionId, request })
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/recorded-app",
        },
      })
    },
  }
}

const createAction = (
  loginGymUser: GymUserLoginActionDependencies["loginGymUser"]
) => {
  const redirect = createRedirectRecorder()

  return {
    action: createGymUserLoginAction({
      loginGymUser,
      redirectToAppWithSessionCookie: redirect.redirectToAppWithSessionCookie,
    }),
    redirectCalls: redirect.calls,
  }
}

describe("gym-user login action", () => {
  it("returns inline validation errors before calling the login dependency", async () => {
    const loginCalls: GymUserLoginInput[] = []
    const { action } = createAction((input) => {
      loginCalls.push(input)
      return Effect.succeed(loginSuccess)
    })

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "not-an-email",
          password: "",
        })
      ),
    })) as LoginActionData

    expect(loginCalls).toHaveLength(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      email: "Enter a valid email.",
      password: "Enter your password.",
    })
  })

  it("invalid input does not require the production API base URL", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      const result = (await gymUserLoginAction({
        request: actionRequest(
          new URLSearchParams({
            email: "not-an-email",
            password: "",
          })
        ),
      })) as LoginActionData

      expect(result.status).toBe("error")
      expect(result.fieldErrors).toEqual({
        email: "Enter a valid email.",
        password: "Enter your password.",
      })
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("requires the API base URL to be configured for valid production logins", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "member@test.dev",
              password: "correct horse battery staple",
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

  it("passes normalized input to the login dependency and redirects on success", async () => {
    const loginCalls: GymUserLoginInput[] = []
    const { action, redirectCalls } = createAction((input) => {
      loginCalls.push(input)
      return Effect.succeed(loginSuccess)
    })
    const request = actionRequest(
      new URLSearchParams({
        email: "MEMBER@TEST.DEV",
        password: "correct horse battery staple",
      })
    )

    const response = (await action({ request })) as Response

    expect(loginCalls).toEqual([
      {
        email: "member@test.dev",
        password: "correct horse battery staple",
      },
    ])
    expect(redirectCalls).toEqual([
      {
        sessionId: "gym-user-session-1",
        request,
      },
    ])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/recorded-app")
  })

  it("returns expected auth failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "GymUserInvalidCredentials",
        email: "missing@test.dev",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "missing@test.dev",
          password: "correct horse battery staple",
        })
      ),
    })) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toContain("email and password")
  })

  it("returns unverified-user failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "GymUserUnverified",
        userId: "gym-user-1",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "member@test.dev",
          password: "correct horse battery staple",
        })
      ),
    })) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toContain("verify your email")
  })

  it("returns transport failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "HttpClientError",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "member@test.dev",
          password: "correct horse battery staple",
        })
      ),
    })) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toBe(
      "An unexpected error occurred. Please try again later."
    )
  })

  it("returns schema failures as inline action data", async () => {
    const { action } = createAction(() =>
      Effect.fail({
        _tag: "SchemaError",
      } as const)
    )

    const result = (await action({
      request: actionRequest(
        new URLSearchParams({
          email: "member@test.dev",
          password: "correct horse battery staple",
        })
      ),
    })) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toBe("Check the highlighted fields and try again.")
  })

  it("redirects successful logins to the app with a web-owned session cookie", () => {
    const response = redirectToAppWithSessionCookie(
      "gym-user-session-1",
      actionRequest(new URLSearchParams())
    )

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/app")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("redirects successful logins to a safe same-app return target", () => {
    const response = redirectToAppWithSessionCookie(
      "gym-user-session-1",
      new Request(
        "https://kryno.test/login?redirectTo=%2Fapp%2Fstaff-invitations%2Faccept%3Ftoken%3Dstaff-token-1"
      )
    )

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "/app/staff-invitations/accept?token=staff-token-1"
    )
  })

  it.each([
    "",
    "https://evil.test/app",
    "//evil.test/app",
    "app",
    "javascript:alert(1)",
  ])("falls back to the app for unsafe return target %s", (redirectTo) => {
    const response = redirectToAppWithSessionCookie(
      "gym-user-session-1",
      new Request(
        `https://kryno.test/login?redirectTo=${encodeURIComponent(redirectTo)}`
      )
    )

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/app")
  })

  it("does not mark the session cookie secure for local HTTP development", () => {
    const response = redirectToAppWithSessionCookie(
      "gym-user-session-1",
      localActionRequest(new URLSearchParams())
    )

    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax",
    ])
  })

  it("maps password reset completion query status to a login message", () => {
    expect(
      LoginActionViewModel.statusMessage("password-reset-complete")
    ).toEqual({
      variant: "success",
      message: "Your password has been reset. Sign in with your new password.",
    })
  })
})
