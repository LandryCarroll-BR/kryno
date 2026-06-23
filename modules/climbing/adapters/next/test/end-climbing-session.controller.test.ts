import { Effect } from "effect"
import { describe, expect, it, vi } from "vitest"

vi.mock("@packages/effect-next", async () => {
  const { Effect } = await import("effect")

  return {
    Headers: {
      Cookies: Effect.succeed({
        get: (name: string) =>
          name === "authToken" ? { value: "valid-token" } : undefined,
      }),
    },
    Navigation: {
      Redirect: () => Effect.die("unexpected redirect"),
    },
  }
})

import {
  ClimbingAdapterTestRuntime,
  EndClimbingSessionController,
  StartClimbingSessionController,
} from "./index"

describe("EndClimbingSessionController", () => {
  it("reads the auth cookie and presents the ended session", async () => {
    await ClimbingAdapterTestRuntime.runPromise(
      StartClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    const result = await ClimbingAdapterTestRuntime.runPromise(
      EndClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result.status).toBe("ended")
    if (result.status === "ended") {
      expect(result.sessionId).toBe("climbing-session-1")
    }
  })

  it("presents an error when there is no active session", async () => {
    await ClimbingAdapterTestRuntime.runPromise(
      StartClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )
    await ClimbingAdapterTestRuntime.runPromise(
      EndClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    const result = await ClimbingAdapterTestRuntime.runPromise(
      EndClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result).toEqual({
      status: "error",
      error: "You do not have an active climbing session to end.",
    })
  })
})
