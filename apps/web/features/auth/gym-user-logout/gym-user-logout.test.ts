import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import {
  createGymUserLogoutAction,
  redirectToLoginWithExpiredSessionCookie,
  type GymUserLogoutActionDependencies,
} from "./gym-user-logout-action"

const createAction = (
  logoutGymUser: GymUserLogoutActionDependencies["logoutGymUser"]
) =>
  createGymUserLogoutAction({
    logoutGymUser,
    redirectToLoginWithExpiredSessionCookie,
  })

describe("gym-user logout action", () => {
  it("logs out the bearer session, clears the web cookie, and redirects to login", async () => {
    const sessionIds: string[] = []
    const action = createAction((sessionId) => {
      sessionIds.push(sessionId)
      return Effect.void
    })

    const response = await action({
      request: new Request("https://kryno.test/logout", {
        method: "POST",
        headers: {
          Cookie:
            "theme=dark; kryno_gym_user_session=gym-user-session-1; sidebar=open",
        },
      }),
    })

    expect(sessionIds).toEqual(["gym-user-session-1"])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("clears the web cookie and redirects to login when no session cookie exists", async () => {
    const sessionIds: string[] = []
    const action = createAction((sessionId) => {
      sessionIds.push(sessionId)
      return Effect.void
    })

    const response = await action({
      request: new Request("https://kryno.test/logout", { method: "POST" }),
    })

    expect(sessionIds).toEqual([])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure",
    ])
  })

  it("still clears the web cookie when the server session is already invalid", async () => {
    const action = createAction(() =>
      Effect.fail({
        _tag: "GymUserSessionInvalid",
        sessionId: "expired-session",
      } as const)
    )

    const response = await action({
      request: new Request("http://localhost:5173/logout", {
        method: "POST",
        headers: {
          Cookie: "kryno_gym_user_session=expired-session",
        },
      }),
    })

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
    expect(response.headers.getSetCookie()).toEqual([
      "kryno_gym_user_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    ])
  })

  it("does not swallow unexpected logout failures", async () => {
    const unexpected = new Error("API server unavailable")
    const action = createAction(() => Effect.fail(unexpected))

    await expect(
      action({
        request: new Request("https://kryno.test/logout", {
          method: "POST",
          headers: {
            Cookie: "kryno_gym_user_session=gym-user-session-1",
          },
        }),
      })
    ).rejects.toBe(unexpected)
  })
})
