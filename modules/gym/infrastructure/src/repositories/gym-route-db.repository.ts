import { asc, eq, inArray } from "drizzle-orm"
import { Effect, Layer, Option, Schema } from "effect"
import { GymRoute } from "@gym/application/models/gym-route"
import { GymRouteRepository } from "@gym/application/repositories/gym-route"

import { GymDB } from "../db/context"
import { gymRoutesTable } from "../schemas/gym-routes.schema"

const toGymRoute = (
  row: typeof gymRoutesTable.$inferSelect
): GymRoute =>
  Schema.decodeUnknownSync(GymRoute)(row)

export const GymRouteDBRepository = Layer.effect(
  GymRouteRepository,
  Effect.gen(function* () {
    const db = yield* GymDB

    return {
      findByAreaIds: Effect.fn("GymRouteRepository.findByAreaIds")(
        function* (areaIds) {
          if (areaIds.length === 0) {
            return []
          }

          const routes = yield* db
            .select()
            .from(gymRoutesTable)
            .where(inArray(gymRoutesTable.areaId, [...areaIds]))
            .orderBy(
              asc(gymRoutesTable.areaId),
              asc(gymRoutesTable.order),
              asc(gymRoutesTable.id)
            )
            .pipe(Effect.orDie)

          return routes.map(toGymRoute)
        }
      ),

      findByBoulderIds: Effect.fn("GymRouteRepository.findByBoulderIds")(
        function* (boulderIds) {
          if (boulderIds.length === 0) {
            return []
          }

          const routes = yield* db
            .select()
            .from(gymRoutesTable)
            .where(inArray(gymRoutesTable.boulderId, [...boulderIds]))
            .orderBy(asc(gymRoutesTable.id))
            .pipe(Effect.orDie)

          return routes.map(toGymRoute)
        }
      ),

      findById: Effect.fn("GymRouteRepository.findById")(
        function* (routeId) {
          const [route] = yield* db
            .select()
            .from(gymRoutesTable)
            .where(eq(gymRoutesTable.id, routeId))
            .limit(1)
            .pipe(Effect.orDie)

          return Option.fromNullishOr(route).pipe(Option.map(toGymRoute))
        }
      ),

      deleteById: Effect.fn("GymRouteRepository.deleteById")(
        function* (routeId) {
          const [deleted] = yield* db
            .delete(gymRoutesTable)
            .where(eq(gymRoutesTable.id, routeId))
            .returning()
            .pipe(Effect.orDie)

          return Option.fromNullishOr(deleted).pipe(Option.map(toGymRoute))
        }
      ),

      insert: Effect.fn("GymRouteRepository.insert")(function* (route) {
        const [created] = yield* db
          .insert(gymRoutesTable)
          .values({
            id: route.id,
            areaId: route.areaId,
            order: route.order,
            positionLabel: Option.getOrNull(route.positionLabel),
            setOn: route.setOn,
            setterName: Option.getOrNull(route.setterName),
            boulderId: route.boulderId,
            imageUrl: Option.getOrNull(route.imageUrl),
          })
          .onConflictDoNothing()
          .returning()
          .pipe(Effect.orDie)

        return Option.fromNullishOr(created).pipe(Option.map(toGymRoute))
      }),

      update: Effect.fn("GymRouteRepository.update")(function* (route) {
        const [updated] = yield* db
          .update(gymRoutesTable)
          .set({
            areaId: route.areaId,
            order: route.order,
            positionLabel: Option.getOrNull(route.positionLabel),
            setOn: route.setOn,
            setterName: Option.getOrNull(route.setterName),
            boulderId: route.boulderId,
            imageUrl: Option.getOrNull(route.imageUrl),
          })
          .where(eq(gymRoutesTable.id, route.id))
          .returning()
          .pipe(Effect.orDie)

        return Option.fromNullishOr(updated).pipe(Option.map(toGymRoute))
      }),
    }
  })
)
