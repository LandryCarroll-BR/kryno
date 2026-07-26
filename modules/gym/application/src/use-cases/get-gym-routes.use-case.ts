import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { AssignableGymBoulder } from "../services/gym-boulder-catalog.service"
import type { UnauthenticatedGymMemberError } from "../errors/gym-membership.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import type { GymArea } from "../models/gym-area.models"
import type { GymRoute } from "../models/gym-route.models"
import { GymId, type Gym } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymMembershipRepository } from "../repositories/gym-membership.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { AuthenticatedGymMember } from "../services/authenticated-gym-member.service"
import { GymBoulderCatalog } from "../services/gym-boulder-catalog.service"

export const GetGymRoutesInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
}).annotate({ identifier: "GetGymRoutesInput" })

export type GetGymRoutesInput = typeof GetGymRoutesInputSchema.Type

export type GymRouteWithBoulder = {
  readonly route: GymRoute
  readonly boulder: Option.Option<AssignableGymBoulder>
}

export type GymAreaWithRoutes = {
  readonly area: GymArea
  readonly routes: readonly GymRouteWithBoulder[]
}

export type GetGymRoutesOutput = {
  readonly gym: Gym
  readonly isMember: boolean
  readonly areas: readonly GymAreaWithRoutes[]
}

export class GetGymRoutesUseCase extends Service<
  GetGymRoutesUseCase,
  {
    readonly execute: (
      input: GetGymRoutesInput
    ) => Effect.Effect<
      GetGymRoutesOutput,
      SchemaError | UnauthenticatedGymMemberError | GymNotFoundError
    >
  }
>()("@gym/application/GetGymRoutesUseCase") {
  static Live = Layer.effect(
    GetGymRoutesUseCase,
    Effect.gen(function* () {
      const authenticatedGymMember = yield* AuthenticatedGymMember
      const gymRepository = yield* GymRepository
      const membershipRepository = yield* GymMembershipRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog

      return {
        execute: Effect.fn("GetGymRoutesUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              GetGymRoutesInputSchema
            )(input, { errors: "all" })
            const memberId = yield* authenticatedGymMember.resolve(
              parsedInput.token
            )
            const gym = yield* gymRepository.findById(parsedInput.gymId)

            if (Option.isNone(gym)) {
              return yield* new GymNotFoundError({
                gymId: parsedInput.gymId,
              })
            }

            const membership =
              yield* membershipRepository.findByGymIdAndMemberId(
                parsedInput.gymId,
                memberId
              )

            if (Option.isNone(membership)) {
              return {
                gym: gym.value,
                isMember: false,
                areas: [],
              }
            }

            const areas = yield* areaRepository.findByGymId(
              parsedInput.gymId
            )
            const routes = yield* routeRepository.findByAreaIds(
              areas.map(({ id }) => id)
            )
            const boulders = yield* boulderCatalog.getByIds(
              routes.map(({ boulderId }) => boulderId)
            )
            const bouldersById = new Map(
              boulders.map((boulder) => [boulder.id, boulder])
            )

            return {
              gym: gym.value,
              isMember: true,
              areas: areas.map((area) => ({
                area,
                routes: routes
                  .filter(({ areaId }) => areaId === area.id)
                  .map((route) => ({
                    route,
                    boulder: Option.fromNullishOr(
                      bouldersById.get(route.boulderId)
                    ),
                  })),
              })),
            }
          }
        ),
      }
    })
  )
}
