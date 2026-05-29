import { describe, expect, it } from "@effect/vitest"
import { HttpApi } from "effect/unstable/httpapi"
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
    expect(endpoints.get("approveGymCreationRequest")?.path).toBe(
      "/api/auth/gyms/requests/approvals"
    )
  })
})
