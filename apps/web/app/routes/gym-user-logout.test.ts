import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import { createGymUserLogoutAction } from "./gym-user-logout"
import type {
  KrynoApiEffect,
  KrynoApiClientOptions,
} from "../../lib/kryno-api/kryno-api-client"

type LogoutApiClient = {
  readonly auth: {
    readonly logoutGymUser: () => KrynoApiEffect
  }
}

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const noopClient: LogoutApiClient = {
  auth: {
    logoutGymUser: () => Effect.void,
  },
}

describe("gym-user logout action", () => {
  it("logs out the bearer session, clears the web cookie, and redirects to login", async () => {
    const clientOptions: KrynoApiClientOptions[] = []
    const client: LogoutApiClient = {
      auth: {
        logoutGymUser: () => Effect.void,
      },
    }
    const action = createGymUserLogoutAction(async (options) => {
      clientOptions.push(options ?? {})
      return client
    })

    const response = (await action(
      actionArgs(
        new Request("https://kryno.test/logout", {
          method: "POST",
          headers: {
            Cookie:
              "theme=dark; kryno_gym_user_session=gym-user-session-1; sidebar=open",
          },
        })
      )
    )) as Response

    expect(clientOptions).toEqual([{ sessionId: "gym-user-session-1" }])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("clears the web cookie and redirects to login when no session cookie exists", async () => {
    let calls = 0
    const action = createGymUserLogoutAction(async () => {
      calls += 1
      return noopClient
    })

    const response = (await action(
      actionArgs(new Request("https://kryno.test/logout", { method: "POST" }))
    )) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("still clears the web cookie when the server session is already invalid", async () => {
    const action = createGymUserLogoutAction(async () => ({
      auth: {
        logoutGymUser: () =>
          Effect.fail({
            _tag: "GymUserSessionInvalid",
            sessionId: "expired-session",
          }),
      },
    }))

    const response = (await action(
      actionArgs(
        new Request("http://localhost:5173/logout", {
          method: "POST",
          headers: {
            Cookie: "kryno_gym_user_session=expired-session",
          },
        })
      )
    )) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    ])
  })
})
