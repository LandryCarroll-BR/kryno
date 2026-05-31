import { describe, expect, it } from "@effect/vitest"
import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import {
  GymUserSessionRequired,
  SystemAdminSessionRequired,
} from "@workspace/auth/api/auth-authorization"

import { KrynoHttpApi } from "../src/kryno-http-api.ts"

const hasMiddleware = (
  middlewares: ReadonlySet<unknown>,
  middleware: unknown
) => middlewares.has(middleware)

const publicEndpointNames = [
  "bootstrapFirstSystemAdmin",
  "completeGymUserPasswordReset",
  "loginGymUser",
  "loginSystemAdmin",
  "requestGymUserPasswordReset",
  "reserveGymUserEmail",
  "signUpGymUser",
  "verifyGymUserEmail",
] as const

const gymUserEndpointNames = [
  "acceptGymStaffInvitation",
  "createGymStaffInvitation",
  "currentGymOwnerAccess",
  "currentGymUserSession",
  "joinGymAsMember",
  "leaveGymAsMember",
  "logoutGymUser",
  "requestGymCreation",
] as const

const systemAdminEndpointNames = [
  "approveGymCreationRequest",
  "currentSystemAdminSession",
  "logoutSystemAdmin",
] as const

describe("Kryno HTTP API contract", () => {
  it("composes the Auth group under the first-party /api prefix", () => {
    const endpoints = new Map<string, string>()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, endpoint.path)
      },
    })

    expect(endpoints.get("loginGymUser")).toBe("/api/auth/gym-users/sessions")
    expect(endpoints.get("reserveGymUserEmail")).toBe(
      "/api/auth/gym-users/email-reservations"
    )
  })

  it("keeps public Auth endpoints allowlisted and protected Auth endpoints behind the intended auth audience", () => {
    const endpoints = new Map<
      string,
      {
        readonly path: string
        readonly audience: "public" | "gym-user" | "system-admin"
      }
    >()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        const audience = hasMiddleware(
          endpoint.middlewares,
          GymUserSessionRequired
        )
          ? "gym-user"
          : hasMiddleware(endpoint.middlewares, SystemAdminSessionRequired)
            ? "system-admin"
            : "public"

        endpoints.set(endpoint.name, {
          path: endpoint.path,
          audience,
        })
      },
    })

    for (const name of publicEndpointNames) {
      expect(endpoints.get(name)?.audience).toBe("public")
    }

    for (const name of gymUserEndpointNames) {
      expect(endpoints.get(name)?.audience).toBe("gym-user")
    }

    for (const name of systemAdminEndpointNames) {
      expect(endpoints.get(name)?.audience).toBe("system-admin")
    }

    expect(endpoints.get("reserveGymUserEmail")?.path).toBe(
      "/api/auth/gym-users/email-reservations"
    )
    expect(endpoints.get("requestGymCreation")?.path).toBe(
      "/api/auth/gyms/requests"
    )
    expect(endpoints.get("currentGymUserSession")?.path).toBe(
      "/api/auth/gym-users/session"
    )
    expect(endpoints.get("logoutGymUser")?.path).toBe(
      "/api/auth/gym-users/session"
    )
    expect(endpoints.get("currentSystemAdminSession")?.path).toBe(
      "/api/auth/system-admin/session"
    )
    expect(endpoints.get("logoutSystemAdmin")?.path).toBe(
      "/api/auth/system-admin/session"
    )
    expect(endpoints.get("approveGymCreationRequest")?.path).toBe(
      "/api/auth/gyms/requests/approvals"
    )
    expect(
      [...endpoints.values()].map((endpoint) => endpoint.path)
    ).not.toContain("/api/auth/gym-users/sessions/:sessionId")
    expect(
      [...endpoints.values()].map((endpoint) => endpoint.path)
    ).not.toContain("/api/auth/system-admin/sessions/:sessionId")
  })

  it("keeps protected Auth payload contracts free of client-supplied session ids", () => {
    const spec = OpenApi.fromApi(KrynoHttpApi)

    const protectedPayloadPaths = [
      "/api/auth/gyms/requests",
      "/api/auth/gyms/requests/approvals",
      "/api/auth/gyms/owner-access",
      "/api/auth/gyms/member-affiliations",
      "/api/auth/gyms/member-affiliations/leaves",
      "/api/auth/gyms/staff-invitations",
      "/api/auth/gyms/staff-invitations/acceptances",
    ] as const

    for (const path of protectedPayloadPaths) {
      expect(
        JSON.stringify(spec.paths[path]?.post?.requestBody ?? {})
      ).not.toContain("sessionId")
    }
  })
})
