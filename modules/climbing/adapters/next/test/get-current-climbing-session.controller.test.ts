import { Effect } from "effect"
import { describe, expect, it, vi } from "vitest"

const authCookie = vi.hoisted(() => ({
  value: "valid-token" as string | undefined,
}))

vi.mock("@packages/effect-next", async () => {
  const { Effect } = await import("effect")

  return {
    Headers: {
      Cookies: Effect.succeed({
        get: (name: string) =>
          name === "authToken" && authCookie.value !== undefined
            ? { value: authCookie.value }
            : undefined,
      }),
    },
    Navigation: {
      Redirect: (url: string) => Effect.succeed({ status: "redirect", url }),
    },
  }
})

import {
  ClimbingAdapterTestRuntime,
  GetCurrentClimbingSessionController,
  StartClimbingSessionController,
} from "./index"

describe("GetCurrentClimbingSessionController", () => {
  it("reads the auth cookie and presents no active session", async () => {
    authCookie.value = "valid-token"

    const result = await ClimbingAdapterTestRuntime.runPromise(
      GetCurrentClimbingSessionController({
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result).toEqual({ status: "none" })
  })

  it("reads the auth cookie and presents the active session", async () => {
    authCookie.value = "valid-token"

    await ClimbingAdapterTestRuntime.runPromise(
      StartClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    const result = await ClimbingAdapterTestRuntime.runPromise(
      GetCurrentClimbingSessionController({
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result.status).toBe("active")
    if (result.status === "active") {
      expect(result.sessionId).toBe("climbing-session-1")
      expect(result.startedAt).toEqual(expect.any(String))
    }
  })

  it("redirects when the auth cookie is missing", async () => {
    authCookie.value = undefined

    const result = await ClimbingAdapterTestRuntime.runPromise(
      GetCurrentClimbingSessionController({
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result).toEqual({ status: "redirect", url: "/sign-in" })
  })

  it("redirects when the auth cookie is invalid", async () => {
    authCookie.value = "invalid-token"

    const result = await ClimbingAdapterTestRuntime.runPromise(
      GetCurrentClimbingSessionController({
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result).toEqual({ status: "redirect", url: "/sign-in" })
  })
})
