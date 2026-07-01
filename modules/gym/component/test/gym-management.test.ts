import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Predicate } from "effect"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymId, GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

const createGym = (gym: Gym["Service"]) =>
  gym.createGym({
    token: "admin-token",
    name: GymName.make("The Cliffs"),
  })

describe("Gym management", () => {
  it.effect("creates areas with deterministic ids and lists them by name", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)

      const horseshoe = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Horseshoe"),
      })
      yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Barrel"),
      })

      expect(horseshoe.id).toBe("area-1")

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(management.areas.map(({ area }) => area.name)).toEqual([
        "Barrel",
        "Horseshoe",
      ])
      expect(management.assignableBoulders).toHaveLength(2)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects duplicate area names case-insensitively", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Barrel"),
      })

      const error = yield* Effect.flip(
        gym.createGymArea({
          token: "admin-token",
          gymId: createdGym.id,
          name: GymAreaName.make("barrel"),
        })
      )

      expect(
        Predicate.isTagged(error, "GymAreaNameAlreadyExistsError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("creates assigned and unassigned routes ordered within an area", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Horseshoe"),
      })

      const second = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(2),
        positionLabel: "Right",
        setOn: GymRouteSetDate.make("2026-06-29"),
        setterName: "Morgan",
        boulderId: BoulderId.make("admin-boulder-1"),
      })
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-06-30"),
        setterName: "",
        boulderId: "",
      })

      expect(second.id).toBe("route-1")
      expect(Option.getOrNull(second.positionLabel)).toBe("Right")
      expect(Option.getOrNull(second.boulderId)).toBe("admin-boulder-1")

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(management.areas[0]?.routes.map(({ order }) => order)).toEqual([
        1, 2,
      ])
      expect(
        Option.isNone(management.areas[0]!.routes[0]!.boulderId)
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects duplicate route order and unowned boulders", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Barrel"),
      })
      const baseInput = {
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-06-30"),
        setterName: null,
        boulderId: null,
      }
      yield* gym.createGymRoute(baseInput)

      const duplicate = yield* Effect.flip(gym.createGymRoute(baseInput))
      expect(
        Predicate.isTagged(duplicate, "GymRouteOrderAlreadyExistsError")
      ).toBe(true)

      const unowned = yield* Effect.flip(
        gym.createGymRoute({
          ...baseInput,
          order: GymRouteOrder.make(2),
          boulderId: BoulderId.make("another-users-boulder"),
        })
      )
      expect(
        Predicate.isTagged(unowned, "GymRouteBoulderNotAssignableError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("validates gym and area ownership", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const firstGym = yield* createGym(gym)
      const secondGym = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Movement"),
      })
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: firstGym.id,
        name: GymAreaName.make("Barrel"),
      })

      const missingGym = yield* Effect.flip(
        gym.createGymArea({
          token: "admin-token",
          gymId: GymId.make("missing-gym"),
          name: GymAreaName.make("Nowhere"),
        })
      )
      expect(Predicate.isTagged(missingGym, "GymNotFoundError")).toBe(true)

      const wrongGym = yield* Effect.flip(
        gym.createGymRoute({
          token: "admin-token",
          gymId: secondGym.id,
          areaId: area.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-06-30"),
          setterName: null,
          boulderId: null,
        })
      )
      expect(
        Predicate.isTagged(wrongGym, "GymAreaNotFoundError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("requires a global administrator", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)

      const unauthorized = yield* Effect.flip(
        gym.createGymArea({
          token: "user-token",
          gymId: createdGym.id,
          name: GymAreaName.make("Barrel"),
        })
      )
      expect(
        Predicate.isTagged(
          unauthorized,
          "UnauthorizedGymAdministratorError"
        )
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )
})
