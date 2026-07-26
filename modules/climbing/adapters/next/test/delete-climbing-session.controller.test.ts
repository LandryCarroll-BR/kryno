import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { beforeEach, vi } from "vitest"
import { ClimbingSessionId } from "@climbing/application/models/climbing-session"
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

import { DeleteClimbingSessionController } from "../src/controllers/delete-climbing-session.controller"
import { deleteClimbingSessionInitialViewModel } from "../src/view-models/delete-climbing-session.view-model"
import { ClimbingAdapterTestRuntime } from "./index"

describe("DeleteClimbingSessionController", () => {
  beforeEach(() => {
    mocks.authTokenValue = "valid-token"
    mocks.redirect.mockClear()
  })

  it("returns success when the session is deleted", async () => {
    const viewModel = await ClimbingAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const climbing = yield* Climbing
        const session = yield* climbing.startClimbingSession({
          token: "valid-token",
        })
        yield* climbing.endClimbingSession({ token: "valid-token" })
        const controller = yield* DeleteClimbingSessionController({
          previousState: deleteClimbingSessionInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("climbingSessionId", session.id)

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("success")
    expect(viewModel.fields.climbingSessionId.value).not.toBe("")
  })

  it("returns invalid state for malformed input", async () => {
    const viewModel = await ClimbingAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const controller = yield* DeleteClimbingSessionController({
          previousState: deleteClimbingSessionInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("climbingSessionId", " ")

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("invalid")
    expect(viewModel.errors.climbingSessionId).not.toBe("")
  })

  it("returns not-found state for missing sessions", async () => {
    const viewModel = await ClimbingAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const controller = yield* DeleteClimbingSessionController({
          previousState: deleteClimbingSessionInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set(
          "climbingSessionId",
          ClimbingSessionId.make("missing-session")
        )

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("error")
    expect(viewModel.message).toBe(
      "That past climbing session is no longer available."
    )
  })

  it("redirects when there is no auth token", async () => {
    mocks.authTokenValue = undefined

    await expect(
      ClimbingAdapterTestRuntime.runPromise(
        Effect.gen(function* () {
          const controller = yield* DeleteClimbingSessionController({
            previousState: deleteClimbingSessionInitialViewModel,
            redirectUrl: "/sign-in",
          })

          return yield* controller.handle(new FormData())
        })
      )
    ).rejects.toMatchObject({ _tag: "RedirectError", url: "/sign-in" })
    expect(mocks.redirect).toHaveBeenCalledWith("/sign-in")
  })
})
