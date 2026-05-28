import { describe, expect, it } from "@effect/vitest"
import { HttpApi } from "effect/unstable/httpapi"

import { KrynoHttpApi } from "../src/kryno-http-api.ts"

describe("Kryno HTTP API contract", () => {
  it("composes the Auth group under the first-party /api prefix", () => {
    const endpoints = new Map<string, string>()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, endpoint.path)
      },
    })

    expect(endpoints.get("loginGymUser")).toBe(
      "/api/auth/gym-users/sessions"
    )
    expect(endpoints.get("reserveGymUserEmail")).toBe(
      "/api/auth/gym-users/email-reservations"
    )
  })

  it("keeps public Auth endpoints allowlisted and protected Auth endpoints behind edge auth", () => {
    const endpoints = new Map<
      string,
      {
        readonly path: string
        readonly protected: boolean
      }
    >()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, {
          path: endpoint.path,
          protected: endpoint.middlewares.size > 0,
        })
      },
    })

    expect(endpoints.get("reserveGymUserEmail")).toEqual({
      path: "/api/auth/gym-users/email-reservations",
      protected: false,
    })
    expect(endpoints.get("signUpGymUser")).toEqual({
      path: "/api/auth/gym-users/signups",
      protected: false,
    })
    expect(endpoints.get("verifyGymUserEmail")).toEqual({
      path: "/api/auth/gym-users/email-verifications",
      protected: false,
    })
    expect(endpoints.get("loginGymUser")).toEqual({
      path: "/api/auth/gym-users/sessions",
      protected: false,
    })
    expect(endpoints.get("requestGymCreation")).toEqual({
      path: "/api/auth/gyms/requests",
      protected: true,
    })
  })
})
