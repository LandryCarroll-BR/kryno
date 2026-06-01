import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  AppDashboard,
  AppDashboardViewModel,
  createAppLoader,
  GymCreationRequestFormViewModel,
  JoinGymAsMemberFormViewModel,
} from "./app"
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

const authenticatedSessionWithAffiliations = {
  ...authenticatedSession,
  activeAffiliations: [
    {
      gymId: "gym-1",
      userId: "gym-user-1",
      role: "Owner",
      status: "active",
    } as const,
    {
      gymId: "gym-2",
      userId: "gym-user-1",
      role: "Member",
      status: "active",
    } as const,
  ],
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
    expect(response.headers.get("Location")).toBe("/login?redirectTo=%2Fapp")
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
    expect(response.headers.get("Location")).toBe("/login?redirectTo=%2Fapp")
  })

  it("redirects visitors with an unverified session to login", async () => {
    const client: CurrentSessionApiClient = {
      auth: {
        currentGymUserSession: () =>
          Effect.fail({
            _tag: "GymUserUnverified",
            userId: "gym-user-1",
          }),
      },
    }
    const loader = createAppLoader(async () => client)

    const response = (await loader(
      loaderArgs(
        new Request("https://kryno.test/app", {
          headers: {
            Cookie: "kryno_gym_user_session=unverified-session",
          },
        })
      )
    )) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login?redirectTo=%2Fapp")
  })

  it("maps known app query params to dashboard messages", () => {
    expect(AppDashboardViewModel.message("pending-approval", null)).toEqual({
      variant: "success",
      message: "Your gym creation request is pending approval.",
    })
    expect(AppDashboardViewModel.message(null, "unverified")).toEqual({
      variant: "error",
      message: "Please verify your email before using that action.",
    })
    expect(AppDashboardViewModel.message("unknown", "unknown")).toBeUndefined()
  })

  it("renders the signed-in user and active affiliations", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppDashboard, {
        session: authenticatedSessionWithAffiliations,
      })
    )

    expect(html).toContain("Member Test")
    expect(html).toContain("member@test.dev")
    expect(html).toContain("gym-1")
    expect(html).toContain("Owner")
    expect(html).toContain("gym-2")
    expect(html).toContain("Member")
  })

  it("renders an empty affiliations state", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppDashboard, {
        session: authenticatedSession,
      })
    )

    expect(html).toContain("No active gym affiliations")
    expect(html).toContain("Request a new gym or join one when ready.")
  })

  it("renders a functional gym creation request form", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppDashboard, {
        session: authenticatedSession,
      })
    )

    expect(html).toContain('action="/app/gym-creation-request"')
    expect(html).toContain('name="name"')
    expect(html).toContain("Request gym creation")
  })

  it("renders a functional join gym form", () => {
    const html = renderToStaticMarkup(
      React.createElement(AppDashboard, {
        session: authenticatedSession,
      })
    )

    expect(html).toContain('action="/app/join-gym"')
    expect(html).toContain('name="gymId"')
    expect(html).toContain("Join gym")
  })

  it("maps gym creation request validation errors to form messages", () => {
    expect(
      GymCreationRequestFormViewModel.fieldError(
        "gym-creation-request",
        "invalid-name"
      )
    ).toBe("Enter a gym name.")
  })

  it("maps join gym validation errors to form messages", () => {
    expect(
      JoinGymAsMemberFormViewModel.fieldError("join-gym", "invalid-gym-id")
    ).toBe("Enter a gym ID.")
  })
})
