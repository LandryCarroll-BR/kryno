import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { beforeEach, vi } from "vitest"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymName } from "@gym/application/models/gym"
import { Gym } from "@gym/component"

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

import { LogGymRouteAttemptController } from "../src/controllers/log-gym-route-attempt.controller"
import { logGymRouteAttemptInitialViewModel } from "../src/view-models/log-gym-route-attempt.view-model"
import { GymAdapterTestRuntime } from "./index"

describe("LogGymRouteAttemptController", () => {
  beforeEach(() => {
    mocks.authTokenValue = "user-token"
    mocks.redirect.mockClear()
  })

  it("logs repeated move type fields from form data", async () => {
    const viewModel = await GymAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const gym = yield* Gym
        const createdGym = yield* gym.createGym({
          token: "admin-token",
          name: GymName.make("Movement"),
        })
        const area = yield* gym.createGymArea({
          token: "admin-token",
          gymId: createdGym.id,
          name: GymAreaName.make("Cave"),
        })
        const route = yield* gym.createGymRoute({
          token: "admin-token",
          gymId: createdGym.id,
          areaId: area.id,
          order: GymRouteOrder.make(1),
          positionLabel: "Left",
          setOn: GymRouteSetDate.make("2026-07-02"),
          setterName: "Morgan",
          boulderId: BoulderId.make("admin-boulder-1"),
        })
        yield* gym.joinGym({ token: "user-token", gymId: createdGym.id })

        const controller = yield* LogGymRouteAttemptController({
          previousState: logGymRouteAttemptInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("gymId", createdGym.id)
        formData.set("routeId", route.id)
        formData.set("outcome", "TOPPED")
        formData.append("moveTypes", "HEEL_HOOK")
        formData.append("moveTypes", "FLAG")

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("success")
    expect(viewModel.fields.outcome.value).toBe("TOPPED")
    expect(viewModel.fields.moveTypes.value).toBe("HEEL_HOOK,FLAG")
  })

  it("returns invalid state for an unknown move type", async () => {
    const viewModel = await GymAdapterTestRuntime.runPromise(
      Effect.gen(function* () {
        const controller = yield* LogGymRouteAttemptController({
          previousState: logGymRouteAttemptInitialViewModel,
          redirectUrl: "/sign-in",
        })
        const formData = new FormData()
        formData.set("gymId", "gym-1")
        formData.set("routeId", "route-1")
        formData.set("outcome", "FELL")
        formData.append("moveTypes", "NOT_A_MOVE")

        return yield* controller.handle(formData)
      })
    )

    expect(viewModel.status).toBe("invalid")
    expect(viewModel.errors.moveTypes).not.toBe("")
  })
})
