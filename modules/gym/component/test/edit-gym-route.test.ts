import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Predicate } from "effect"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteId,
  GymRouteImageBytes,
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

const createArea = (
  gym: Gym["Service"],
  gymId: GymId,
  name: string
) =>
  gym.createGymArea({
    token: "admin-token",
    gymId,
    name: GymAreaName.make(name),
  })

const routeImage = (contentType: "image/png" | "image/webp") => ({
  bytes: GymRouteImageBytes.make(new Uint8Array([1, 2, 3])),
  contentType,
  fileName: contentType === "image/png" ? "route.png" : "route.webp",
})

describe("Gym.editGymRoute", () => {
  it.effect("edits route details, moves areas, and preserves boulder and image", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const cave = yield* createArea(gym, createdGym.id, "Cave")
      const slab = yield* createArea(gym, createdGym.id, "Slab")
      const route = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: cave.id,
        order: GymRouteOrder.make(1),
        positionLabel: "Left",
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: "Morgan",
        boulderId: BoulderId.make("admin-boulder-1"),
        routeImage: routeImage("image/png"),
      })

      const edited = yield* gym.editGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        routeId: route.id,
        areaId: slab.id,
        order: GymRouteOrder.make(2),
        positionLabel: "Right arete",
        setOn: GymRouteSetDate.make("2026-07-08"),
        setterName: "",
      })

      expect(edited).toMatchObject({
        id: route.id,
        areaId: slab.id,
        order: 2,
        setOn: "2026-07-08",
        boulderId: "admin-boulder-1",
      })
      expect(Option.getOrNull(edited.positionLabel)).toBe("Right arete")
      expect(Option.getOrNull(edited.setterName)).toBe(null)
      expect(Option.getOrNull(edited.imageUrl)).toBe(
        "/uploads/gym-routes/route-1.png"
      )

      const management = yield* gym.getGymManagement({
        token: "admin-token",
        gymId: createdGym.id,
      })
      expect(
        management.areas.find(({ area }) => area.id === cave.id)?.routes
      ).toEqual([])
      expect(
        management.areas.find(({ area }) => area.id === slab.id)?.routes[0]
      ).toEqual(edited)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("replaces an existing route image", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* createArea(gym, createdGym.id, "Topout")
      const route = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
        routeImage: routeImage("image/png"),
      })

      const edited = yield* gym.editGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        routeId: route.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-03"),
        setterName: null,
        routeImage: routeImage("image/webp"),
      })

      expect(Option.getOrNull(route.imageUrl)).toBe(
        "/uploads/gym-routes/route-1.png"
      )
      expect(Option.getOrNull(edited.imageUrl)).toBe(
        "/uploads/gym-routes/route-1.webp"
      )
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects duplicate route order in the target area", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* createArea(gym, createdGym.id, "Barrel")
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
      })
      const second = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(2),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-2"),
      })

      const error = yield* Effect.flip(
        gym.editGymRoute({
          token: "admin-token",
          gymId: createdGym.id,
          routeId: second.id,
          areaId: area.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )

      expect(
        Predicate.isTagged(error, "GymRouteOrderAlreadyExistsError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("validates gym, route, and target area ownership", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const firstGym = yield* createGym(gym, "First Gym")
      const secondGym = yield* createGym(gym, "Second Gym")
      const firstArea = yield* createArea(gym, firstGym.id, "Cave")
      const secondArea = yield* createArea(gym, secondGym.id, "Slab")
      const route = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: firstGym.id,
        areaId: firstArea.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
      })

      const missingGym = yield* Effect.flip(
        gym.editGymRoute({
          token: "admin-token",
          gymId: GymId.make("missing-gym"),
          routeId: route.id,
          areaId: firstArea.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )
      const missingRoute = yield* Effect.flip(
        gym.editGymRoute({
          token: "admin-token",
          gymId: firstGym.id,
          routeId: GymRouteId.make("missing-route"),
          areaId: firstArea.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )
      const wrongGym = yield* Effect.flip(
        gym.editGymRoute({
          token: "admin-token",
          gymId: secondGym.id,
          routeId: route.id,
          areaId: firstArea.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )
      const wrongArea = yield* Effect.flip(
        gym.editGymRoute({
          token: "admin-token",
          gymId: firstGym.id,
          routeId: route.id,
          areaId: secondArea.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )

      expect(Predicate.isTagged(missingGym, "GymNotFoundError")).toBe(true)
      expect(
        Predicate.isTagged(missingRoute, "GymRouteNotFoundError")
      ).toBe(true)
      expect(Predicate.isTagged(wrongGym, "GymRouteNotFoundError")).toBe(true)
      expect(Predicate.isTagged(wrongArea, "GymAreaNotFoundError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("requires a global administrator", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const createdGym = yield* createGym(gym)
      const area = yield* createArea(gym, createdGym.id, "Cave")
      const route = yield* gym.createGymRoute({
        token: "admin-token",
        gymId: createdGym.id,
        areaId: area.id,
        order: GymRouteOrder.make(1),
        positionLabel: null,
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: null,
        boulderId: BoulderId.make("admin-boulder-1"),
      })

      const error = yield* Effect.flip(
        gym.editGymRoute({
          token: "user-token",
          gymId: createdGym.id,
          routeId: route.id,
          areaId: area.id,
          order: GymRouteOrder.make(1),
          positionLabel: null,
          setOn: GymRouteSetDate.make("2026-07-03"),
          setterName: null,
        })
      )

      expect(
        Predicate.isTagged(error, "UnauthorizedGymAdministratorError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )
})
