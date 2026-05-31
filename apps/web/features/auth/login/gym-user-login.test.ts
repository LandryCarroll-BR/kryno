import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import type {
  KrynoApiClient,
  KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { createGymUserLoginAction } from "./gym-user-login-action"
import type { LoginActionData } from "./gym-user-login-view-model"

type LoginGymUserRequest = Parameters<KrynoApiClient["auth"]["loginGymUser"]>[0]

interface LoginSuccess {
  readonly user: {
    readonly id: string
    readonly email: string
    readonly displayName: string
    readonly emailVerified: boolean
  }
  readonly session: {
    readonly id: string
    readonly userId: string
    readonly active: boolean
  }
}

type LoginApiClient = {
  readonly auth: {
    readonly loginGymUser: (
      request: LoginGymUserRequest
    ) => KrynoApiEffect<LoginSuccess>
  }
}

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

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const loginSuccess: LoginSuccess = {
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

const noopClient: LoginApiClient = {
  auth: {
    loginGymUser: () => Effect.succeed(loginSuccess),
  },
}

describe("gym-user login action", () => {
  it("returns inline validation errors before calling the API client", async () => {
    let calls = 0
    const action = createGymUserLoginAction(async () => {
      calls += 1
      return noopClient
    })

    const result = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "not-an-email",
            password: "",
          })
        )
      )
    )) as LoginActionData

    expect(calls).toBe(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      email: "Enter a valid email.",
      password: "Enter your password.",
    })
  })

  it("returns expected auth failures as inline action data", async () => {
    const client: LoginApiClient = {
      auth: {
        loginGymUser: () =>
          Effect.fail({
            _tag: "GymUserInvalidCredentials",
            email: "missing@test.dev",
          }),
      },
    }
    const action = createGymUserLoginAction(async () => client)

    const result = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "missing@test.dev",
            password: "correct horse battery staple",
          })
        )
      )
    )) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toContain("email and password")
  })

  it("returns unverified-user failures as inline action data", async () => {
    const client: LoginApiClient = {
      auth: {
        loginGymUser: () =>
          Effect.fail({ _tag: "GymUserUnverified", userId: "gym-user-1" }),
      },
    }
    const action = createGymUserLoginAction(async () => client)

    const result = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "member@test.dev",
            password: "correct horse battery staple",
          })
        )
      )
    )) as LoginActionData

    expect(result.status).toBe("error")
    expect(result.formError).toContain("verify your email")
  })

  it("does not swallow unexpected API failures", async () => {
    const unexpected = new Error("API server unavailable")
    const client: LoginApiClient = {
      auth: {
        loginGymUser: () => Effect.fail(unexpected),
      },
    }
    const action = createGymUserLoginAction(async () => client)

    await expect(
      action(
        actionArgs(
          actionRequest(
            new URLSearchParams({
              email: "member@test.dev",
              password: "correct horse battery staple",
            })
          )
        )
      )
    ).rejects.toBe(unexpected)
  })

  it("redirects successful logins to the app with a web-owned session cookie", async () => {
    const calls: LoginGymUserRequest[] = []
    const client: LoginApiClient = {
      auth: {
        loginGymUser: (request) => {
          calls.push(request)
          return Effect.succeed(loginSuccess)
        },
      },
    }
    const action = createGymUserLoginAction(async () => client)

    const response = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "MEMBER@TEST.DEV",
            password: "correct horse battery staple",
          })
        )
      )
    )) as Response

    expect(calls.map((call) => call.payload)).toEqual([
      {
        email: "member@test.dev",
        password: "correct horse battery staple",
      },
    ])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/app")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("does not mark the session cookie secure for local HTTP development", async () => {
    const action = createGymUserLoginAction(async () => noopClient)

    const response = (await action(
      actionArgs(
        localActionRequest(
          new URLSearchParams({
            email: "member@test.dev",
            password: "correct horse battery staple",
          })
        )
      )
    )) as Response

    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax",
    ])
  })
})
