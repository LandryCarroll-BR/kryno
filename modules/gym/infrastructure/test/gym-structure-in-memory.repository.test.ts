import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { GymArea, GymAreaId, GymAreaName } from "@gym/application/models/gym-area"
import {
  GymRoute,
  GymRouteId,
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
          boulderId: Option.none(),
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
})
