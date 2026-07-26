import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymId, GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

const createPublishedRoute = (gym: Gym["Service"]) =>
  Effect.gen(function* () {
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

    return { createdGym, area, route }
  })

describe("Gym.deleteGymRoute", () => {
  it.effect("deletes a route and its linked boulder", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const { createdGym, route } = yield* createPublishedRoute(gym)

      const deleted = yield* gym.deleteGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        routeId: route.id,
      })
      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })

      expect(deleted).toEqual(route)
      expect(management.areas[0]?.routes).toEqual([])
      expect(management.boulders.some(({ id }) => id === route.boulderId)).toBe(
        false
      )
      expect(
        management.assignableBoulders.some(({ id }) => id === route.boulderId)
      ).toBe(false)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("reports missing routes as not found", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Movement"),
      })

      const error = yield* Effect.flip(
        gym.deleteGymRoute({
          token: "admin-token",
          gymId: createdGym.id,
          routeId: GymRouteId.make("missing-route"),
        })
      )

      expect(Predicate.isTagged(error, "GymRouteNotFoundError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("does not delete routes from another gym", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const { route } = yield* createPublishedRoute(gym)
      const otherGym = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Other Gym"),
      })

      const error = yield* Effect.flip(
        gym.deleteGymRoute({
          token: "admin-token",
          gymId: otherGym.id,
          routeId: route.id,
        })
      )
      const missingGymError = yield* Effect.flip(
        gym.deleteGymRoute({
          token: "admin-token",
          gymId: GymId.make("missing-gym"),
          routeId: route.id,
        })
      )

      expect(Predicate.isTagged(error, "GymRouteNotFoundError")).toBe(true)
      expect(Predicate.isTagged(missingGymError, "GymNotFoundError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("requires a global administrator", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const { createdGym, route } = yield* createPublishedRoute(gym)

      const error = yield* Effect.flip(
        gym.deleteGymRoute({
          token: "user-token",
          gymId: createdGym.id,
          routeId: route.id,
        })
      )

      expect(
        Predicate.isTagged(error, "UnauthorizedGymAdministratorError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )
})
