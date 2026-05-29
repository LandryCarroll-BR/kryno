import { describe, expect, it } from "vitest"

import {
  createGymUserLoginAction,
  type LoginActionData,
} from "./gym-user-login"
import type { KrynoApiClient } from "../lib/kryno-api-client"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/login", {
    method: "POST",
    body,
  })

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const noopClient: KrynoApiClient = {
  signUpGymUser: async () => undefined,
  verifyGymUserEmail: async () => undefined,
  loginGymUser: async () => ({ setCookieHeaders: [] }),
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
    const client: KrynoApiClient = {
      ...noopClient,
      loginGymUser: async () => {
        throw { _tag: "GymUserInvalidCredentials", email: "missing@test.dev" }
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
    const client: KrynoApiClient = {
      ...noopClient,
      loginGymUser: async () => {
        throw { _tag: "GymUserUnverified", userId: "gym-user-1" }
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

  it("redirects successful logins to the app and forwards API cookies", async () => {
    const calls: Array<Parameters<KrynoApiClient["loginGymUser"]>[0]> = []
    const client: KrynoApiClient = {
      ...noopClient,
      loginGymUser: async (input) => {
        calls.push(input)
        return {
          setCookieHeaders: [
            "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly",
          ],
        }
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

    expect(calls).toEqual([
      {
        email: "member@test.dev",
        password: "correct horse battery staple",
      },
    ])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/app")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly",
    ])
  })
})
