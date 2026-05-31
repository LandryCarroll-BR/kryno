import { afterEach, describe, expect, it, vi } from "vitest"

import { getKrynoApiClient } from "./kryno-api-client"

describe("Kryno API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("returns the decoded gym-user login session without relying on set-cookie headers", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => {
        const nextRequest =
          request instanceof Request ? request : new Request(request, init)
        requests.push(nextRequest)
        bodies.push(await nextRequest.clone().json())

        return Response.json(
          {
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
          },
          {
            headers: {
              "Set-Cookie":
                "core_api_session=should-not-be-used; Path=/; HttpOnly",
            },
          }
        )
      })
    )
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient(
      new Request("https://web.kryno.test/login")
    )
    const login = await client.loginGymUser({
      email: "member@test.dev",
      password: "correct horse battery staple",
    })

    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/sessions"
    )
    expect(bodies).toEqual([
      {
        email: "member@test.dev",
        password: "correct horse battery staple",
      },
    ])
    expect(login.session.id).toBe("gym-user-session-1")
    expect(login.user.email).toBe("member@test.dev")
  })
})
