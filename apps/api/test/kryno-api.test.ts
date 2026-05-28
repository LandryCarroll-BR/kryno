import { describe, expect, it } from "@effect/vitest"
import { HttpApi } from "effect/unstable/httpapi"

import { KrynoHttpApi } from "@workspace/api"
import { handler } from "../src/handler.ts"

describe("Kryno API app", () => {
  it("serves Auth routes through the composed /api contract", async () => {
    const response = await handler(
      new Request("https://kryno.test/api/auth/gym-users/email-reservations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "member@example.com",
          displayName: "Member Example",
        }),
      })
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      email: "member@example.com",
      displayName: "Member Example",
      emailVerified: false,
    })
  })

  it("keeps the product API contract under /api without a version prefix", () => {
    const endpoints = new Map<string, string>()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, endpoint.path)
      },
    })

    expect(endpoints.get("reserveGymUserEmail")).toBe(
      "/api/auth/gym-users/email-reservations"
    )
    expect([...endpoints.values()]).not.toContain(
      "/api/v1/auth/gym-users/email-reservations"
    )
  })
})
