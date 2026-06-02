import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { Effect } from "effect"

import {
  getKrynoApiClient,
  type KrynoApiClient,
} from "../../lib/kryno-api/kryno-api-client"

type CreateGymStaffInvitationApiPayload = Parameters<
  KrynoApiClient["auth"]["createGymStaffInvitation"]
>[0]["payload"]

type AcceptGymStaffInvitationApiPayload = Parameters<
  KrynoApiClient["auth"]["acceptGymStaffInvitation"]
>[0]["payload"]

describe("Kryno API client", () => {
  let fetchHandler: (
    request: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>

  beforeAll(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((request: RequestInfo | URL, init?: RequestInit) =>
        fetchHandler(request, init)
      )
    )
  })

  beforeEach(() => {
    fetchHandler = async () => {
      throw new Error("Unexpected fetch call")
    }
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it("sends gym-user signup requests to the configured API base URL", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json(
        {
          user: {
            id: "gym-user-1",
            email: "new@test.dev",
            displayName: "New User",
            emailVerified: false,
          },
        },
        { status: 201 }
      )
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient()
    await Effect.runPromise(
      client.auth.signUpGymUser({
        payload: {
          email: "new@test.dev",
          password: "correct horse battery staple",
          displayName: "New User",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/signups"
    )
    expect(requests[0]?.headers.get("Authorization")).toBeNull()
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([
      {
        email: "new@test.dev",
        password: "correct horse battery staple",
        displayName: "New User",
      },
    ])
  })

  it("sends gym-user email verification requests to the configured API base URL", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json({
        user: {
          id: "gym-user-1",
          email: "new@test.dev",
          displayName: "New User",
          emailVerified: true,
        },
      })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient()
    await Effect.runPromise(
      client.auth.verifyGymUserEmail({
        payload: {
          token: "gym-user-email-verification-token-1",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/email-verifications"
    )
    expect(requests[0]?.headers.get("Authorization")).toBeNull()
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([
      {
        token: "gym-user-email-verification-token-1",
      },
    ])
  })

  it("sends gym-user password reset requests to the configured API base URL", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json({
        email: "member@test.dev",
      })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient()
    await Effect.runPromise(
      client.auth.requestGymUserPasswordReset({
        payload: {
          email: "member@test.dev",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/password-resets"
    )
    expect(requests[0]?.headers.get("Authorization")).toBeNull()
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([
      {
        email: "member@test.dev",
      },
    ])
  })

  it("sends gym-user password reset completion requests to the configured API base URL", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json({
        user: {
          id: "gym-user-1",
          email: "member@test.dev",
          displayName: "Member Test",
          emailVerified: true,
        },
      })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient()
    await Effect.runPromise(
      client.auth.completeGymUserPasswordReset({
        payload: {
          token: "gym-user-password-reset-token-1",
          newPassword: "correct horse battery staple",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/password-resets/completions"
    )
    expect(requests[0]?.headers.get("Authorization")).toBeNull()
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([
      {
        token: "gym-user-password-reset-token-1",
        newPassword: "correct horse battery staple",
      },
    ])
  })

  it("returns the decoded gym-user login session without relying on set-cookie headers", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
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
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient()
    const login = await Effect.runPromise(
      client.auth.loginGymUser({
        payload: {
          email: "member@test.dev",
          password: "correct horse battery staple",
        },
      })
    )

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

  it("resolves the current gym-user session with bearer auth instead of forwarded cookies", async () => {
    const requests: Request[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)

      return Response.json({
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
      })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient({
      sessionId: "gym-user-session-1",
    })
    const current = await Effect.runPromise(client.auth.currentGymUserSession())

    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/session"
    )
    expect(requests[0]?.headers.get("Authorization")).toBe(
      "Bearer gym-user-session-1"
    )
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(current.user.email).toBe("member@test.dev")
  })

  it("requests gym creation with bearer auth from the web session", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json(
        {
          request: {
            id: "gym-creation-request-1",
            gymId: "gym-1",
            requesterUserId: "gym-user-1",
            status: "pending",
          },
          gym: {
            id: "gym-1",
            name: "Boulder Yard",
            status: "pending",
          },
        },
        { status: 201 }
      )
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient({
      sessionId: "gym-user-session-1",
    })
    await Effect.runPromise(
      client.auth.requestGymCreation({
        payload: {
          name: "Boulder Yard",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gyms/requests"
    )
    expect(requests[0]?.headers.get("Authorization")).toBe(
      "Bearer gym-user-session-1"
    )
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([{ name: "Boulder Yard" }])
  })

  it("creates staff invitations with bearer auth from the web session", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json(
        {
          gym: {
            id: "gym-1",
            name: "Boulder Yard",
            status: "active",
          },
          invitation: {
            id: "gym-staff-invitation-1",
            gymId: "gym-1",
            invitedEmail: "staff@test.dev",
            invitedByUserId: "gym-user-1",
            token: "gym-staff-invitation-token-1",
            status: "pending",
          },
        },
        { status: 201 }
      )
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient({
      sessionId: "gym-user-session-1",
    })
    await Effect.runPromise(
      client.auth.createGymStaffInvitation({
        payload: {
          gymId: "gym-1" as CreateGymStaffInvitationApiPayload["gymId"],
          email: "staff@test.dev",
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gyms/staff-invitations"
    )
    expect(requests[0]?.headers.get("Authorization")).toBe(
      "Bearer gym-user-session-1"
    )
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([{ gymId: "gym-1", email: "staff@test.dev" }])
  })

  it("accepts staff invitations with bearer auth from the web session", async () => {
    const requests: Request[] = []
    const bodies: unknown[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)
      bodies.push(await nextRequest.clone().json())

      return Response.json({
        gym: {
          id: "gym-1",
          name: "Boulder Yard",
          status: "active",
        },
        invitation: {
          id: "gym-staff-invitation-1",
          gymId: "gym-1",
          invitedEmail: "staff@test.dev",
          invitedByUserId: "gym-user-owner",
          token: "gym-staff-invitation-token-1",
          status: "accepted",
        },
        affiliation: {
          gymId: "gym-1",
          userId: "gym-user-1",
          role: "Staff",
          status: "active",
        },
      })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient({
      sessionId: "gym-user-session-1",
    })
    await Effect.runPromise(
      client.auth.acceptGymStaffInvitation({
        payload: {
          token:
            "gym-staff-invitation-token-1" as AcceptGymStaffInvitationApiPayload["token"],
        },
      })
    )

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gyms/staff-invitations/acceptances"
    )
    expect(requests[0]?.headers.get("Authorization")).toBe(
      "Bearer gym-user-session-1"
    )
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
    expect(bodies).toEqual([{ token: "gym-staff-invitation-token-1" }])
  })

  it("logs out the current gym-user session with bearer auth instead of forwarded cookies", async () => {
    const requests: Request[] = []
    fetchHandler = async (request: RequestInfo | URL, init?: RequestInit) => {
      const nextRequest =
        request instanceof Request ? request : new Request(request, init)
      requests.push(nextRequest)

      return new Response(null, { status: 204 })
    }
    vi.stubEnv("KRYNO_API_BASE_URL", "https://api.kryno.test")

    const client = await getKrynoApiClient({
      sessionId: "gym-user-session-1",
    })
    await Effect.runPromise(client.auth.logoutGymUser())

    expect(requests).toHaveLength(1)
    expect(requests[0]?.method).toBe("DELETE")
    expect(requests[0]?.url).toBe(
      "https://api.kryno.test/api/auth/gym-users/session"
    )
    expect(requests[0]?.headers.get("Authorization")).toBe(
      "Bearer gym-user-session-1"
    )
    expect(requests[0]?.headers.get("Cookie")).toBeNull()
  })

  it("requires the API base URL to be configured", async () => {
    await expect(getKrynoApiClient()).rejects.toThrow(
      "KRYNO_API_BASE_URL must be configured"
    )
  })
})
