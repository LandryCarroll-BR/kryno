import { describe, expect, it } from "vitest"

import {
  createManualEmailVerificationAction,
  type ManualEmailVerificationActionData,
} from "./manual-email-verification"
import type { KrynoApiClient } from "../lib/kryno-api-client"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/verify-email", {
    method: "POST",
    body,
  })

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const noopClient: KrynoApiClient = {
  signUpGymUser: async () => undefined,
  verifyGymUserEmail: async () => undefined,
  loginGymUser: async () => ({
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
  }),
  currentGymUserSession: async () => ({
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
  }),
  logoutGymUser: async () => undefined,
}

describe("manual email verification action", () => {
  it("returns inline validation errors before calling the API client", async () => {
    let calls = 0
    const action = createManualEmailVerificationAction(async () => {
      calls += 1
      return noopClient
    })

    const result = (await action(
      actionArgs(actionRequest(new URLSearchParams({ token: "" })))
    )) as ManualEmailVerificationActionData

    expect(calls).toBe(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      token: "Enter your verification token.",
    })
  })

  it("returns invalid verification token failures as inline action data", async () => {
    const client: KrynoApiClient = {
      ...noopClient,
      verifyGymUserEmail: async () => {
        throw { _tag: "GymUserEmailVerificationInvalid", token: "missing" }
      },
    }
    const action = createManualEmailVerificationAction(async () => client)

    const result = (await action(
      actionArgs(actionRequest(new URLSearchParams({ token: "missing-token" })))
    )) as ManualEmailVerificationActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toContain("invalid or expired")
  })

  it("redirects successful verification to gym-user login", async () => {
    const calls: Array<Parameters<KrynoApiClient["verifyGymUserEmail"]>[0]> = []
    const client: KrynoApiClient = {
      ...noopClient,
      verifyGymUserEmail: async (input) => {
        calls.push(input)
      },
    }
    const action = createManualEmailVerificationAction(async () => client)

    const response = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            token: " gym-user-email-verification-token-1 ",
          })
        )
      )
    )) as Response

    expect(calls).toEqual([{ token: "gym-user-email-verification-token-1" }])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
  })
})
