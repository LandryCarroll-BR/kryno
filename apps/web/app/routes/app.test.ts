import { describe, expect, it } from "vitest"

import { createAppLoader } from "./app"
import type { KrynoApiClient } from "../lib/kryno-api-client"

const loaderArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const authenticatedSession = {
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
}

const noopClient: KrynoApiClient = {
  signUpGymUser: async () => undefined,
  verifyGymUserEmail: async () => undefined,
  loginGymUser: async () => ({
    user: authenticatedSession.user,
    session: authenticatedSession.session,
  }),
  currentGymUserSession: async () => authenticatedSession,
}

describe("app loader", () => {
  it("reads the web-owned session cookie and resolves the current gym-user session", async () => {
    const sessions: string[] = []
    const client: KrynoApiClient = {
      ...noopClient,
      currentGymUserSession: async (sessionId) => {
        sessions.push(sessionId)
        return authenticatedSession
      },
    }
    const loader = createAppLoader(async () => client)

    const result = await loader(
      loaderArgs(
        new Request("https://kryno.test/app", {
          headers: {
            Cookie:
              "theme=dark; kryno_gym_user_session=gym-user-session-1; sidebar=open",
          },
        })
      )
    )

    expect(sessions).toEqual(["gym-user-session-1"])
    expect(result).toEqual(authenticatedSession)
  })

  it("redirects visitors without a session cookie to login", async () => {
    let calls = 0
    const loader = createAppLoader(async () => {
      calls += 1
      return noopClient
    })

    const response = (await loader(
      loaderArgs(new Request("https://kryno.test/app"))
    )) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
  })

  it("redirects visitors with an invalid session cookie to login", async () => {
    const client: KrynoApiClient = {
      ...noopClient,
      currentGymUserSession: async () => {
        throw { _tag: "GymUserSessionInvalid", sessionId: "expired-session" }
      },
    }
    const loader = createAppLoader(async () => client)

    const response = (await loader(
      loaderArgs(
        new Request("https://kryno.test/app", {
          headers: {
            Cookie: "kryno_gym_user_session=expired-session",
          },
        })
      )
    )) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
  })
})
