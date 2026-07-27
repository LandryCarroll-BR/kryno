import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { GymRouteNotFoundError } from "../errors/gym-route.errors"
import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import { GymRouteId, type GymRoute } from "../models/gym-route.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import { GymBoulderCatalog } from "../services/gym-boulder-catalog.service"
import { GymRouteImageStorage } from "../services/gym-route-image-storage.service"

export const DeleteGymRouteInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  routeId: GymRouteId,
}).annotate({ identifier: "DeleteGymRouteInput" })

export type DeleteGymRouteInput = typeof DeleteGymRouteInputSchema.Type
export type DeleteGymRouteOutput = GymRoute

export class DeleteGymRouteUseCase extends Service<
  DeleteGymRouteUseCase,
  {
    readonly execute: (
      input: DeleteGymRouteInput
    ) => Effect.Effect<
      DeleteGymRouteOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
      | GymRouteNotFoundError
    >
  }
>()("@gym/application/DeleteGymRouteUseCase") {
  static Live = Layer.effect(
    DeleteGymRouteUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog
      const routeImageStorage = yield* GymRouteImageStorage

      return {
        execute: Effect.fn("DeleteGymRouteUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              DeleteGymRouteInputSchema
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

            const route = yield* routeRepository.findById(
              parsedInput.routeId
            )
            if (Option.isNone(route)) {
              return yield* new GymRouteNotFoundError({
                gymId: parsedInput.gymId,
                routeId: parsedInput.routeId,
              })
            }

            const area = yield* areaRepository.findById(route.value.areaId)
            if (
              Option.isNone(area) ||
              area.value.gymId !== parsedInput.gymId
            ) {
              return yield* new GymRouteNotFoundError({
                gymId: parsedInput.gymId,
                routeId: parsedInput.routeId,
              })
            }

            const deleted = yield* routeRepository.deleteById(
              parsedInput.routeId
            )
            if (Option.isNone(deleted)) {
              return yield* new GymRouteNotFoundError({
                gymId: parsedInput.gymId,
                routeId: parsedInput.routeId,
              })
            }

            yield* boulderCatalog
              .deleteOwned({
                token: parsedInput.token,
                boulderId: deleted.value.boulderId,
              })
              .pipe(Effect.catchDefect(() => Effect.void))

            if (Option.isSome(deleted.value.imageUrl)) {
              yield* routeImageStorage
                .delete(deleted.value.imageUrl.value)
                .pipe(Effect.catchDefect(() => Effect.void))
            }

            return deleted.value
          }
        ),
      }
    })
  )
}
