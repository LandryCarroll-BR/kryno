import { describe, expect, it } from "vitest"

import {
  createGymUserSignupAction,
  type SignupActionData,
} from "./gym-user-signup"
import type { KrynoApiClient } from "../lib/kryno-api-client"

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
    const client: KrynoApiClient = {
      ...noopClient,
      signUpGymUser: async () => {
        throw { _tag: "GymUserEmailAlreadyReserved", email: "taken@test.dev" }
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

  it("redirects successful signups to manual email verification", async () => {
    const calls: Array<Parameters<KrynoApiClient["signUpGymUser"]>[0]> = []
    const client: KrynoApiClient = {
      ...noopClient,
      signUpGymUser: async (input) => {
        calls.push(input)
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

    expect(calls).toEqual([
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
