import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { beforeEach, vi } from "vitest"
import { BoulderName } from "@climbing/application/models/boulder"
import { Climbing } from "@climbing/component"

const mocks = vi.hoisted(() => ({
  authTokenValue: undefined as string | undefined,
  redirect: vi.fn((_url: string) => undefined),
}))

vi.mock("@packages/effect-next", async () => {
  const { Data, Effect } = await import("effect")
  class RedirectError extends Data.TaggedError("RedirectError")<{
    readonly url: string
  }> {}

  return {
    Headers: {
      Cookies: Effect.sync(() => ({
        get: (name: string) =>
          name === "authToken" && mocks.authTokenValue !== undefined
            ? { value: mocks.authTokenValue }
            : undefined,
      })),
    },
    Navigation: {
      Redirect: (url: string) =>
        Effect.sync(() => mocks.redirect(url)).pipe(
          Effect.flatMap(() => Effect.fail(new RedirectError({ url })))
        ),
    },
  }
})

import { LogBoulderAttemptController } from "../src/controllers/log-boulder-attempt.controller"
import { logBoulderAttemptInitialViewModel } from "../src/view-models/log-boulder-attempt.view-model"
import { ClimbingAdapterTestRuntime } from "./index"

describe("LogBoulderAttemptController", () => {
  beforeEach(() => {
    mocks.authTokenValue = "valid-token"
    mocks.redirect.mockClear()
  })

  it("logs repeated move type fields from form data", async () => {
    const viewModel = await ClimbingAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const climbing = yield* Climbing
        const boulder = yield* climbing.createBoulder({
          token: "valid-token",
          name: BoulderName.make("Move type test"),
          grade: "V4",
          color: "BLUE",
          wallAngle: "OVERHANG",
          movementStyle: "POWER",
        })
        yield* climbing.startClimbingSession({ token: "valid-token" })
        const controller = yield* LogBoulderAttemptController({
          previousState: logBoulderAttemptInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("boulderId", boulder.id)
        formData.set("outcome", "TOPPED")
        formData.append("moveTypes", "HEEL_HOOK")
        formData.append("moveTypes", "FLAG")
        formData.set(
          "video",
          new File([new Uint8Array([1, 2, 3])], "attempt.webm", {
            type: "video/webm",
          })
        )

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("success")
    expect(viewModel.fields.outcome.value).toBe("TOPPED")
    expect(viewModel.fields.moveTypes.value).toBe("HEEL_HOOK,FLAG")
    expect(viewModel.fields.video.value).toMatch(
      /^\/uploads\/climbing-attempt-videos\/attempt-\d+\.webm$/
    )
  })

  it("returns invalid state for an unknown move type", async () => {
    const viewModel = await ClimbingAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const controller = yield* LogBoulderAttemptController({
          previousState: logBoulderAttemptInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("boulderId", "boulder-1")
        formData.set("outcome", "FELL")
        formData.append("moveTypes", "NOT_A_MOVE")

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("invalid")
    expect(viewModel.errors.moveTypes).not.toBe("")
  })
})
