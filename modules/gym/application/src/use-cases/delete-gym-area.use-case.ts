import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { GymAreaNotFoundError } from "../errors/gym-area.errors"
import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import { GymAreaId, type GymArea } from "../models/gym-area.models"
import type { GymRoute } from "../models/gym-route.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import { GymBoulderCatalog } from "../services/gym-boulder-catalog.service"
import { GymRouteImageStorage } from "../services/gym-route-image-storage.service"

export const DeleteGymAreaInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  areaId: GymAreaId,
}).annotate({ identifier: "DeleteGymAreaInput" })

export type DeleteGymAreaInput = typeof DeleteGymAreaInputSchema.Type
export type DeleteGymAreaOutput = {
  readonly area: GymArea
  readonly deletedRoutes: readonly GymRoute[]
}

export class DeleteGymAreaUseCase extends Service<
  DeleteGymAreaUseCase,
  {
    readonly execute: (
      input: DeleteGymAreaInput
    ) => Effect.Effect<
      DeleteGymAreaOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
      | GymAreaNotFoundError
    >
  }
>()("@gym/application/DeleteGymAreaUseCase") {
  static Live = Layer.effect(
    DeleteGymAreaUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog
      const routeImageStorage = yield* GymRouteImageStorage

      return {
        execute: Effect.fn("DeleteGymAreaUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              DeleteGymAreaInputSchema
            )(input, { errors: "all" })

            yield* authorization.authorize(parsedInput.token)

            if (
              Option.isNone(
                yield* gymRepository.findById(parsedInput.gymId)
              )
            ) {
              return yield* new GymNotFoundError({
                gymId: parsedInput.gymId,
              })
            }

            const area = yield* areaRepository.findById(parsedInput.areaId)
            if (
              Option.isNone(area) ||
              area.value.gymId !== parsedInput.gymId
            ) {
              return yield* new GymAreaNotFoundError({
                gymId: parsedInput.gymId,
                areaId: parsedInput.areaId,
              })
            }

            const routes = yield* routeRepository.findByAreaIds([
              area.value.id,
            ])
            const deletedRoutes: GymRoute[] = []

            for (const route of routes) {
              const deleted = yield* routeRepository.deleteById(route.id)
              if (Option.isSome(deleted)) {
                deletedRoutes.push(deleted.value)
              }
            }

            const deletedArea = yield* areaRepository.deleteById(
              area.value.id
            )
            if (Option.isNone(deletedArea)) {
              return yield* new GymAreaNotFoundError({
                gymId: parsedInput.gymId,
                areaId: parsedInput.areaId,
              })
            }

            for (const route of deletedRoutes) {
              yield* boulderCatalog
                .deleteOwned({
                  token: parsedInput.token,
                  boulderId: route.boulderId,
                })
                .pipe(Effect.catchDefect(() => Effect.void))

              if (Option.isSome(route.imageUrl)) {
                yield* routeImageStorage
                  .delete(route.imageUrl.value)
                  .pipe(Effect.catchDefect(() => Effect.void))
              }
            }

            return {
              area: deletedArea.value,
              deletedRoutes,
            }
          }
        ),
      }
    })
  )
}
