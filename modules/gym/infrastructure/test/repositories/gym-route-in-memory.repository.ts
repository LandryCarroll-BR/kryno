import { Effect, Layer, Option, Ref } from "effect"
import type { GymRoute } from "@gym/application/models/gym-route"
import { GymRouteRepository } from "@gym/application/repositories/gym-route"

export const GymRouteInMemoryRepository = Layer.effect(
  GymRouteRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, GymRoute>())

    return {
      findByAreaIds: Effect.fn("GymRouteRepository.findByAreaIds")(
        function* (areaIds) {
          const routes = yield* Ref.get(store)
          const included = new Set(areaIds)
          return [...routes.values()]
            .filter((route) => included.has(route.areaId))
            .sort(
              (left, right) =>
                left.areaId.localeCompare(right.areaId) ||
                left.order - right.order ||
                left.id.localeCompare(right.id)
            )
        }
      ),

      insert: Effect.fn("GymRouteRepository.insert")(function* (route) {
        return yield* Ref.modify(store, (routes) => {
          const duplicate = [...routes.values()].some(
            (candidate) =>
              candidate.areaId === route.areaId &&
              candidate.order === route.order
          )

          if (duplicate) {
            return [Option.none<GymRoute>(), routes]
          }

          const next = new Map(routes)
          next.set(route.id, route)
          return [Option.some(route), next]
        })
      }),
    }
  })
)
