import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Predicate } from "effect"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderGrade,
  BoulderId,
  GymRouteOrder,
  GymRouteSetDate,
  MovementStyle,
  WallAngle,
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

  it.effect("creates uniquely assigned routes ordered within an area", () =>
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
        boulderId: BoulderId.make("admin-boulder-2"),
      })

      expect(second.id).toBe("route-1")
      expect(Option.getOrNull(second.positionLabel)).toBe("Right")
      expect(second.boulderId).toBe("admin-boulder-1")

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(management.areas[0]?.routes.map(({ order }) => order)).toEqual([
        1, 2,
      ])
      expect(management.assignableBoulders).toEqual([])
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("defaults route order to the next area increment", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Barrel"),
      })

      const first = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-08"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
      })
      const second = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-08"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-2"),
      })

      expect(first.order).toBe(1)
      expect(second.order).toBe(2)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("creates a route with an inline boulder and links it", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Moonboard"),
      })

      const route = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: "Center",
        setOn: GymRouteSetDate.make("2026-07-10"),
        setterName: "Jordan",
        boulderSource: "new",
        boulderGrade: BoulderGrade.make("V5"),
        boulderColor: "GREEN",
        boulderWallAngle: WallAngle.make("VERTICAL"),
        boulderMovementStyle: MovementStyle.make("TECHNICAL"),
      })

      expect(route.boulderId).toBe("created-boulder-1")

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(management.areas[0]?.routes[0]?.boulderId).toBe(
        "created-boulder-1"
      )
      expect(
        management.boulders.find(({ id }) => id === route.boulderId)
      ).toMatchObject({
        name: "Moonboard Green V5",
        grade: "V5",
        color: "GREEN",
      })
      expect(
        management.assignableBoulders.some(({ id }) => id === route.boulderId)
      ).toBe(false)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("does not leave a new boulder behind when route order conflicts", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* gym.createGymArea({
        token: "admin-token",
        gymId: createdGym.id,
        name: GymAreaName.make("Spray Wall"),
      })
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-11"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
      })

      const conflict = yield* Effect.flip(
        gym.createGymRoute({
          token: "admin-token",
          gymId: createdGym.id,
          areaId: area.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-12"),
          setterName: null,
          boulderSource: "new",
          boulderGrade: BoulderGrade.make("V3"),
          boulderColor: "PURPLE",
          boulderWallAngle: WallAngle.make("SLAB"),
          boulderMovementStyle: MovementStyle.make("COORDINATION"),
        })
      )
      expect(
        Predicate.isTagged(conflict, "GymRouteOrderAlreadyExistsError")
      ).toBe(true)

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(
        management.boulders.some(({ name }) => name === "Spray Wall Purple V3")
      ).toBe(false)
      expect(management.assignableBoulders.map(({ id }) => id)).toEqual([
        "admin-boulder-2",
      ])
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects duplicate route order, reused boulders, and unowned boulders", () =>
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
        boulderId: BoulderId.make("admin-boulder-1"),
      }
      yield* gym.createGymRoute(baseInput)

      const duplicate = yield* Effect.flip(
        gym.createGymRoute({
          ...baseInput,
          boulderId: BoulderId.make("admin-boulder-2"),
        })
      )
      expect(
        Predicate.isTagged(duplicate, "GymRouteOrderAlreadyExistsError")
      ).toBe(true)

      const reusedBoulder = yield* Effect.flip(
        gym.createGymRoute({
          ...baseInput,
          order: GymRouteOrder.make(2),
        })
      )
      expect(
        Predicate.isTagged(
          reusedBoulder,
          "GymRouteBoulderAlreadyAssignedError"
        )
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
          boulderId: BoulderId.make("admin-boulder-1"),
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
