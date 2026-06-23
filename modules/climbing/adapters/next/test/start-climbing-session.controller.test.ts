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
  StartClimbingSessionController,
} from "./index"

describe("StartClimbingSessionController", () => {
  it("reads the auth cookie and presents the active session", async () => {
    const result = await ClimbingAdapterTestRuntime.runPromise(
      StartClimbingSessionController({
        previousState: { status: "idle" },
        redirectUrl: "/sign-in",
      }).pipe(Effect.flatMap(({ handle }) => handle()))
    )

    expect(result.status).toBe("success")
    if (result.status === "success") {
      expect(result.sessionId).toBe("climbing-session-1")
    }
  })
})
