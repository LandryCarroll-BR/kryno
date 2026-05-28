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
})
