import { describe, expect, it } from "vitest"

import { createGymUserLogoutAction } from "./gym-user-logout"
import type { KrynoApiClient } from "../lib/kryno-api-client"

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const noopClient: KrynoApiClient = {
  signUpGymUser: async () => undefined,
  verifyGymUserEmail: async () => undefined,
  loginGymUser: async () => ({
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
  }),
  currentGymUserSession: async () => ({
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
    activeAffiliations: [],
  }),
  logoutGymUser: async () => undefined,
}

describe("gym-user logout action", () => {
  it("logs out the bearer session, clears the web cookie, and redirects to login", async () => {
    const sessions: string[] = []
    const client: KrynoApiClient = {
      ...noopClient,
      logoutGymUser: async (sessionId) => {
        sessions.push(sessionId)
      },
    }
    const action = createGymUserLogoutAction(async () => client)

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

    expect(sessions).toEqual(["gym-user-session-1"])
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
      ...noopClient,
      logoutGymUser: async () => {
        throw { _tag: "GymUserSessionInvalid", sessionId: "expired-session" }
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
