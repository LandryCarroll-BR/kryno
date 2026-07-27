import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import {
  GymAreaId,
  GymAreaName,
} from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymId, GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

const createGym = (gym: Gym["Service"], name = "Movement") =>
  gym.createGym({
    token: "admin-token",
    name: GymName.make(name),
  })

describe("Gym.deleteGymArea", () => {
  it.effect("deletes an area and all of its linked routes and boulders", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Cave"),
      })
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: "Left",
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: "Morgan",
        boulderId: BoulderId.make("admin-boulder-1"),
      })
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(2),
        positionLabel: "Right",
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: "Morgan",
        boulderId: BoulderId.make("admin-boulder-2"),
      })

      const deleted = yield* gym.deleteGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
      })
      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })

      expect(deleted.area).toEqual(area)
      expect(deleted.deletedRoutes.map(({ order }) => order)).toEqual([1, 2])
      expect(management.areas).toEqual([])
      expect(management.boulders).toEqual([])
      expect(management.assignableBoulders).toEqual([])
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("deletes an empty area", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Barrel"),
      })

      const deleted = yield* gym.deleteGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
      })

      expect(deleted.area).toEqual(area)
      expect(deleted.deletedRoutes).toEqual([])
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("reports missing and cross-gym areas as not found", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Cave"),
      })
      const otherGym = yield* createGym(gym, "Other Gym")

      const missingAreaError = yield* Effect.flip(
        gym.deleteGymArea({
          token: "admin-token",
          gymId: createdGym.id,
          areaId: GymAreaId.make("missing-area"),
        })
      )
      const crossGymError = yield* Effect.flip(
        gym.deleteGymArea({
          token: "admin-token",
          gymId: otherGym.id,
          areaId: area.id,
        })
      )
      const missingGymError = yield* Effect.flip(
        gym.deleteGymArea({
          token: "admin-token",
          gymId: GymId.make("missing-gym"),
          areaId: area.id,
        })
      )

      expect(Predicate.isTagged(missingAreaError, "GymAreaNotFoundError")).toBe(
        true
      )
      expect(Predicate.isTagged(crossGymError, "GymAreaNotFoundError")).toBe(
        true
      )
      expect(Predicate.isTagged(missingGymError, "GymNotFoundError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("requires a global administrator", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Cave"),
      })

      const error = yield* Effect.flip(
        gym.deleteGymArea({
          token: "user-token",
          gymId: createdGym.id,
          areaId: area.id,
        })
      )

      expect(
        Predicate.isTagged(error, "UnauthorizedGymAdministratorError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )
})
