import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { GymArea, GymAreaId, GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRoute,
  GymRouteId,
  GymRouteImageUrl,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymId } from "@gym/application/models/gym"
import { GymAreaRepository } from "@gym/application/repositories/gym-area"
import { GymRouteRepository } from "@gym/application/repositories/gym-route"

import { GymAreaInMemoryRepository } from "./repositories/gym-area-in-memory.repository"
import { GymRouteInMemoryRepository } from "./repositories/gym-route-in-memory.repository"

describe("Gym structure in-memory repositories", () => {
  it.effect("enforces case-insensitive area uniqueness and alphabetical order", () =>
    Effect.gen(function* () {
      const repository = yield* GymAreaRepository
      const gymId = GymId.make("gym-1")

      yield* repository.insert(
        GymArea.make({
          id: GymAreaId.make("area-2"),
          gymId,
          name: GymAreaName.make("Horseshoe"),
        })
      )
      yield* repository.insert(
        GymArea.make({
          id: GymAreaId.make("area-1"),
          gymId,
          name: GymAreaName.make("Barrel"),
        })
      )
      const duplicate = yield* repository.insert(
        GymArea.make({
          id: GymAreaId.make("area-3"),
          gymId,
          name: GymAreaName.make("barrel"),
        })
      )

      expect(Option.isNone(duplicate)).toBe(true)
      expect(
        (yield* repository.findByGymId(gymId)).map(({ name }) => name)
      ).toEqual(["Barrel", "Horseshoe"])
    }).pipe(Effect.provide(GymAreaInMemoryRepository))
  )

  it.effect("deletes areas by id and returns the deleted area", () =>
    Effect.gen(function* () {
      const repository = yield* GymAreaRepository
      const gymId = GymId.make("gym-1")
      const area = GymArea.make({
        id: GymAreaId.make("area-1"),
        gymId,
        name: GymAreaName.make("Barrel"),
      })

      yield* repository.insert(area)

      const deleted = yield* repository.deleteById(area.id)
      const missing = yield* repository.findById(area.id)
      const deletedAgain = yield* repository.deleteById(area.id)

      expect(Option.getOrNull(deleted)).toEqual(area)
      expect(Option.isNone(missing)).toBe(true)
      expect(Option.isNone(deletedAgain)).toBe(true)
    }).pipe(Effect.provide(GymAreaInMemoryRepository))
  )

  it.effect("enforces route order uniqueness and numeric ordering", () =>
    Effect.gen(function* () {
      const repository = yield* GymRouteRepository
      const areaId = GymAreaId.make("area-1")
      const makeRoute = (id: string, order: number) =>
        GymRoute.make({
          id: GymRouteId.make(id),
          areaId,
          order: GymRouteOrder.make(order),
          positionLabel: Option.none(),
          setOn: GymRouteSetDate.make("2026-06-30"),
          setterName: Option.none(),
          boulderId: BoulderId.make(`boulder-${id}`),
        })

      yield* repository.insert(makeRoute("route-2", 2))
      yield* repository.insert(makeRoute("route-1", 1))
      const duplicate = yield* repository.insert(makeRoute("route-3", 1))

      expect(Option.isNone(duplicate)).toBe(true)
      expect(
        (yield* repository.findByAreaIds([areaId])).map(({ order }) => order)
      ).toEqual([1, 2])
    }).pipe(Effect.provide(GymRouteInMemoryRepository))
  )

  it.effect("deletes routes by id and returns the deleted route", () =>
    Effect.gen(function* () {
      const repository = yield* GymRouteRepository
      const areaId = GymAreaId.make("area-1")
      const route = GymRoute.make({
        id: GymRouteId.make("route-1"),
        areaId,
        order: GymRouteOrder.make(1),
        positionLabel: Option.none(),
        setOn: GymRouteSetDate.make("2026-06-30"),
        setterName: Option.none(),
        boulderId: BoulderId.make("boulder-1"),
        imageUrl: Option.some(
          GymRouteImageUrl.make("/uploads/gym-routes/route-1.png")
        ),
      })

      yield* repository.insert(route)

      const deleted = yield* repository.deleteById(route.id)
      const missing = yield* repository.findById(route.id)
      const deletedAgain = yield* repository.deleteById(route.id)

      expect(Option.getOrNull(deleted)).toEqual(route)
      expect(Option.isNone(missing)).toBe(true)
      expect(Option.isNone(deletedAgain)).toBe(true)
    }).pipe(Effect.provide(GymRouteInMemoryRepository))
  )
})
