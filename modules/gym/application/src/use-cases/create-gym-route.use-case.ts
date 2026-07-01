import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import { BoulderId } from "@climbing/application/models/boulder"

import { GymAreaNotFoundError } from "../errors/gym-area.errors"
import {
  GymRouteBoulderNotAssignableError,
  GymRouteOrderAlreadyExistsError,
} from "../errors/gym-route.errors"
import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import { GymAreaId } from "../models/gym-area.models"
import {
  GymRoute,
  GymRouteOrder,
  GymRoutePositionLabel,
  GymRouteSetDate,
  GymRouteSetterName,
} from "../models/gym-route.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import { GymBoulderCatalog } from "../services/gym-boulder-catalog.service"
import { GymRouteIdService } from "../services/gym-route-id.service"

const GymRouteOrderFromString = Schema.NumberFromString.pipe(
  Schema.check(
    Schema.isInt({ message: "Route order must be an integer." }),
    Schema.isGreaterThanOrEqualTo(1, {
      message: "Route order must be a positive integer.",
    })
  ),
  Schema.brand("GymRouteOrder")
)

const GymRouteOrderInput = Schema.Union([
  GymRouteOrder,
  GymRouteOrderFromString,
])

const OptionalTrimmedString = Schema.NullOr(Schema.Trim)
const OptionalBoulderId = Schema.NullOr(
  Schema.Union([Schema.Literal(""), BoulderId])
)

export const CreateGymRouteInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  areaId: GymAreaId,
  order: GymRouteOrderInput,
  positionLabel: OptionalTrimmedString,
  setOn: GymRouteSetDate,
  setterName: OptionalTrimmedString,
  boulderId: OptionalBoulderId,
}).annotate({ identifier: "CreateGymRouteInput" })

export type CreateGymRouteInput = typeof CreateGymRouteInputSchema.Type
export type CreateGymRouteOutput = GymRoute

const optionalPositionLabel = (value: string | null) =>
  value === null || value === ""
    ? Option.none<GymRoutePositionLabel>()
    : Option.some(GymRoutePositionLabel.make(value))

const optionalSetterName = (value: string | null) =>
  value === null || value === ""
    ? Option.none<GymRouteSetterName>()
    : Option.some(GymRouteSetterName.make(value))

const optionalBoulderId = (value: BoulderId | "" | null) =>
  value === null || value === ""
    ? Option.none<BoulderId>()
    : Option.some(value)

export class CreateGymRouteUseCase extends Service<
  CreateGymRouteUseCase,
  {
    readonly execute: (
      input: CreateGymRouteInput
    ) => Effect.Effect<
      CreateGymRouteOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
      | GymAreaNotFoundError
      | GymRouteOrderAlreadyExistsError
      | GymRouteBoulderNotAssignableError
    >
  }
>()("@gym/application/CreateGymRouteUseCase") {
  static Live = Layer.effect(
    CreateGymRouteUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const boulderCatalog = yield* GymBoulderCatalog
      const routeIdService = yield* GymRouteIdService

      return {
        execute: Effect.fn("CreateGymRouteUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            CreateGymRouteInputSchema
          )(input, { errors: "all" })

          yield* authorization.authorize(parsedInput.token)

          if (
            Option.isNone(
              yield* gymRepository.findById(parsedInput.gymId)
            )
          ) {
            return yield* new GymNotFoundError({ gymId: parsedInput.gymId })
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

          const boulderId = optionalBoulderId(parsedInput.boulderId)
          if (Option.isSome(boulderId)) {
            const ownedBoulders = yield* boulderCatalog.listOwned(
              parsedInput.token
            )
            if (
              !ownedBoulders.some(({ id }) => id === boulderId.value)
            ) {
              return yield* new GymRouteBoulderNotAssignableError({
                boulderId: boulderId.value,
              })
            }
          }

          const id = yield* routeIdService.generate()
          const inserted = yield* routeRepository.insert(
            GymRoute.make({
              id,
              areaId: parsedInput.areaId,
              order: parsedInput.order,
              positionLabel: optionalPositionLabel(
                parsedInput.positionLabel
              ),
              setOn: parsedInput.setOn,
              setterName: optionalSetterName(parsedInput.setterName),
              boulderId,
            })
          )

          if (Option.isNone(inserted)) {
            return yield* new GymRouteOrderAlreadyExistsError({
              areaId: parsedInput.areaId,
              order: parsedInput.order,
            })
          }

          return inserted.value
        }),
      }
    })
  )
}
