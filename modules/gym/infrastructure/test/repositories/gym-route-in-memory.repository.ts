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

      findByBoulderIds: Effect.fn("GymRouteRepository.findByBoulderIds")(
        function* (boulderIds) {
          const routes = yield* Ref.get(store)
          const included = new Set(boulderIds)
          return [...routes.values()]
            .filter((route) => included.has(route.boulderId))
            .sort((left, right) => left.id.localeCompare(right.id))
        }
      ),

      findById: Effect.fn("GymRouteRepository.findById")(
        function* (routeId) {
          const routes = yield* Ref.get(store)
          return Option.fromNullishOr(routes.get(routeId))
        }
      ),

      deleteById: Effect.fn("GymRouteRepository.deleteById")(
        function* (routeId) {
          return yield* Ref.modify(store, (routes) => {
            const route = routes.get(routeId)
            if (route === undefined) {
              return [Option.none<GymRoute>(), routes]
            }

            const next = new Map(routes)
            next.delete(routeId)
            return [Option.some(route), next]
          })
        }
      ),

      insert: Effect.fn("GymRouteRepository.insert")(function* (route) {
        return yield* Ref.modify(store, (routes) => {
          const duplicate = [...routes.values()].some(
            (candidate) =>
              candidate.areaId === route.areaId &&
                candidate.order === route.order ||
              candidate.boulderId === route.boulderId
          )

          if (duplicate) {
            return [Option.none<GymRoute>(), routes]
          }

          const next = new Map(routes)
          next.set(route.id, route)
          return [Option.some(route), next]
        })
      }),

      update: Effect.fn("GymRouteRepository.update")(function* (route) {
        return yield* Ref.modify(store, (routes) => {
          if (!routes.has(route.id)) {
            return [Option.none<GymRoute>(), routes]
          }

          const duplicate = [...routes.values()].some(
            (candidate) =>
              candidate.id !== route.id &&
              (candidate.areaId === route.areaId &&
                candidate.order === route.order ||
                candidate.boulderId === route.boulderId)
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
