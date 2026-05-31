import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import {
  createGymUserSignupAction,
  type SignupActionData,
} from "./gym-user-signup"
import type { KrynoApiClient, KrynoApiEffect } from "../lib/kryno-api-client"

type SignupApiClient = {
  readonly auth: {
    readonly signUpGymUser: (request: SignUpGymUserRequest) => KrynoApiEffect
  }
}

type SignUpGymUserRequest = Parameters<
  KrynoApiClient["auth"]["signUpGymUser"]
>[0]

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/signup", {
    method: "POST",
    body,
  })

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const noopClient: SignupApiClient = {
  auth: {
    signUpGymUser: () => Effect.void,
  },
}

describe("gym-user signup action", () => {
  it("returns inline validation errors before calling the API client", async () => {
    let calls = 0
    const action = createGymUserSignupAction(async () => {
      calls += 1
      return noopClient
    })

    const result = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "not-an-email",
            password: "short",
            displayName: "",
          })
        )
      )
    )) as SignupActionData

    expect(calls).toBe(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors).toEqual({
      email: "Enter a valid email.",
      password: "Use at least 8 characters.",
      displayName: "Enter your display name.",
    })
  })

  it("returns duplicate email failures as inline action data", async () => {
    const client: SignupApiClient = {
      auth: {
        signUpGymUser: () =>
          Effect.fail({
            _tag: "GymUserEmailAlreadyReserved",
            email: "taken@test.dev",
          }),
      },
    }
    const action = createGymUserSignupAction(async () => client)

    const result = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "taken@test.dev",
            password: "correct horse battery staple",
            displayName: "Taken",
          })
        )
      )
    )) as SignupActionData

    expect(result.status).toBe("error")
    expect(result.fieldErrors?.email).toContain("already reserved")
  })

  it("does not swallow unexpected API failures", async () => {
    const unexpected = new Error("API server unavailable")
    const client: SignupApiClient = {
      auth: {
        signUpGymUser: () => Effect.fail(unexpected),
      },
    }
    const action = createGymUserSignupAction(async () => client)

    await expect(
      action(
        actionArgs(
          actionRequest(
            new URLSearchParams({
              email: "new@test.dev",
              password: "correct horse battery staple",
              displayName: "New User",
            })
          )
        )
      )
    ).rejects.toBe(unexpected)
  })

  it("redirects successful signups to manual email verification", async () => {
    const calls: SignUpGymUserRequest[] = []
    const client: SignupApiClient = {
      auth: {
        signUpGymUser: (request) => {
          calls.push(request)
          return Effect.void
        },
      },
    }
    const action = createGymUserSignupAction(async () => client)

    const response = (await action(
      actionArgs(
        actionRequest(
          new URLSearchParams({
            email: "NEW@TEST.DEV",
            password: "correct horse battery staple",
            displayName: "New User",
          })
        )
      )
    )) as Response

    expect(calls.map((call) => call.payload)).toEqual([
      {
        email: "new@test.dev",
        password: "correct horse battery staple",
        displayName: "New User",
      },
    ])
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "/verify-email?email=new%40test.dev"
    )
  })
})
