import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import { createAppLoader } from "./app"
import type {
  KrynoApiEffect,
  KrynoApiClientOptions,
} from "../../lib/kryno-api/kryno-api-client"

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

type CurrentSessionApiClient = {
  readonly auth: {
    readonly currentGymUserSession: () => KrynoApiEffect<
      typeof authenticatedSession
    >
  }
}

const noopClient: CurrentSessionApiClient = {
  auth: {
    currentGymUserSession: () => Effect.succeed(authenticatedSession),
  },
}

describe("app loader", () => {
  it("reads the web-owned session cookie and resolves the current gym-user session", async () => {
    const clientOptions: KrynoApiClientOptions[] = []
    const client: CurrentSessionApiClient = {
      auth: {
        currentGymUserSession: () => Effect.succeed(authenticatedSession),
      },
    }
    const loader = createAppLoader(async (options) => {
      clientOptions.push(options ?? {})
      return client
    })

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

    expect(clientOptions).toEqual([{ sessionId: "gym-user-session-1" }])
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
    const client: CurrentSessionApiClient = {
      auth: {
        currentGymUserSession: () =>
          Effect.fail({
            _tag: "GymUserSessionInvalid",
            sessionId: "expired-session",
          }),
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
