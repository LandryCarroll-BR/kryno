import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import {
  createManualEmailVerificationAction,
  type ManualEmailVerificationActionData,
} from "./manual-email-verification"
import type {
  KrynoApiClient,
  KrynoApiEffect,
} from "../../lib/kryno-api/kryno-api-client"

type VerificationApiClient = {
  readonly auth: {
    readonly verifyGymUserEmail: (
      request: VerifyGymUserEmailRequest
    ) => KrynoApiEffect
  }
}

type VerifyGymUserEmailRequest = Parameters<
  KrynoApiClient["auth"]["verifyGymUserEmail"]
>[0]

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

const noopClient: VerificationApiClient = {
  auth: {
    verifyGymUserEmail: () => Effect.void,
  },
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
    const client: VerificationApiClient = {
      auth: {
        verifyGymUserEmail: () =>
          Effect.fail({
            _tag: "GymUserEmailVerificationInvalid",
            token: "missing",
          }),
      },
    }
    const action = createManualEmailVerificationAction(async () => client)

    const result = (await action(
      actionArgs(actionRequest(new URLSearchParams({ token: "missing-token" })))
    )) as ManualEmailVerificationActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toContain("invalid or expired")
  })

  it("does not swallow unexpected API failures", async () => {
    const unexpected = new Error("API server unavailable")
    const client: VerificationApiClient = {
      auth: {
        verifyGymUserEmail: () => Effect.fail(unexpected),
      },
    }
    const action = createManualEmailVerificationAction(async () => client)

    await expect(
      action(
        actionArgs(
          actionRequest(
            new URLSearchParams({
              token: "gym-user-email-verification-token-1",
            })
          )
        )
      )
    ).rejects.toBe(unexpected)
  })

  it("redirects successful verification to gym-user login", async () => {
    const calls: VerifyGymUserEmailRequest[] = []
    const client: VerificationApiClient = {
      auth: {
        verifyGymUserEmail: (request) => {
          calls.push(request)
          return Effect.void
        },
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

    expect(calls.map((call) => call.payload)).toEqual([
      { token: "gym-user-email-verification-token-1" },
    ])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/login")
  })
})
