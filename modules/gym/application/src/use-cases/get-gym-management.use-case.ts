import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import type { GymArea } from "../models/gym-area.models"
import type { GymRoute } from "../models/gym-route.models"
import { GymId, type Gym } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import {
  GymBoulderCatalog,
  type AssignableGymBoulder,
} from "../services/gym-boulder-catalog.service"

export const GetGymManagementInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
}).annotate({ identifier: "GetGymManagementInput" })

export type GetGymManagementInput =
  typeof GetGymManagementInputSchema.Type

export type ManagedGymArea = {
  readonly area: GymArea
  readonly routes: readonly GymRoute[]
}

export type GetGymManagementOutput = {
  readonly gym: Gym
  readonly areas: readonly ManagedGymArea[]
  readonly assignableBoulders: readonly AssignableGymBoulder[]
}

export class GetGymManagementUseCase extends Service<
  GetGymManagementUseCase,
  {
    readonly execute: (
      input: GetGymManagementInput
    ) => Effect.Effect<
      GetGymManagementOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
    >
  }
>()("@gym/application/GetGymManagementUseCase") {
  static Live = Layer.effect(
    GetGymManagementUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog

      return {
        execute: Effect.fn("GetGymManagementUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              GetGymManagementInputSchema
            )(input, { errors: "all" })

            yield* authorization.authorize(parsedInput.token)
            const gym = yield* gymRepository.findById(parsedInput.gymId)

            if (Option.isNone(gym)) {
              return yield* new GymNotFoundError({
                gymId: parsedInput.gymId,
              })
            }

            const areas = yield* areaRepository.findByGymId(
              parsedInput.gymId
            )
            const [routes, assignableBoulders] = yield* Effect.all([
              routeRepository.findByAreaIds(
                areas.map(({ id }) => id)
              ),
              boulderCatalog.listOwned(parsedInput.token),
            ])

            return {
              gym: gym.value,
              areas: areas.map((area) => ({
                area,
                routes: routes.filter(
                  ({ areaId }) => areaId === area.id
                ),
              })),
              assignableBoulders,
            }
          }
        ),
      }
    })
  )
}
