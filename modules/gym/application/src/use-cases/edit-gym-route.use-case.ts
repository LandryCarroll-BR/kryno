import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { GymAreaNotFoundError } from "../errors/gym-area.errors"
import {
  GymRouteNotFoundError,
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
  GymRouteId,
  GymRouteImageUpload,
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
import { GymRouteImageStorage } from "../services/gym-route-image-storage.service"

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

export const EditGymRouteInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  routeId: GymRouteId,
  areaId: GymAreaId,
  order: GymRouteOrderInput,
  positionLabel: OptionalTrimmedString,
  setOn: GymRouteSetDate,
  setterName: OptionalTrimmedString,
  routeImage: Schema.optional(GymRouteImageUpload),
}).annotate({ identifier: "EditGymRouteInput" })

export type EditGymRouteInput = typeof EditGymRouteInputSchema.Type
export type EditGymRouteOutput = GymRoute

const optionalPositionLabel = (value: string | null) =>
  value === null || value === ""
    ? Option.none<GymRoutePositionLabel>()
    : Option.some(GymRoutePositionLabel.make(value))

const optionalSetterName = (value: string | null) =>
  value === null || value === ""
    ? Option.none<GymRouteSetterName>()
    : Option.some(GymRouteSetterName.make(value))

export class EditGymRouteUseCase extends Service<
  EditGymRouteUseCase,
  {
    readonly execute: (
      input: EditGymRouteInput
    ) => Effect.Effect<
      EditGymRouteOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
      | GymAreaNotFoundError
      | GymRouteNotFoundError
      | GymRouteOrderAlreadyExistsError
    >
  }
>()("@gym/application/EditGymRouteUseCase") {
  static Live = Layer.effect(
    EditGymRouteUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const routeRepository = yield* GymRouteRepository
      const routeImageStorage = yield* GymRouteImageStorage

      return {
        execute: Effect.fn("EditGymRouteUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            EditGymRouteInputSchema
          )(input, { errors: "all" })

          yield* authorization.authorize(parsedInput.token)

          if (
            Option.isNone(
              yield* gymRepository.findById(parsedInput.gymId)
            )
          ) {
            return yield* new GymNotFoundError({ gymId: parsedInput.gymId })
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

          const currentArea = yield* areaRepository.findById(
            route.value.areaId
          )
          if (
            Option.isNone(currentArea) ||
            currentArea.value.gymId !== parsedInput.gymId
          ) {
            return yield* new GymRouteNotFoundError({
              gymId: parsedInput.gymId,
              routeId: parsedInput.routeId,
            })
          }

          const targetArea = yield* areaRepository.findById(
            parsedInput.areaId
          )
          if (
            Option.isNone(targetArea) ||
            targetArea.value.gymId !== parsedInput.gymId
          ) {
            return yield* new GymAreaNotFoundError({
              gymId: parsedInput.gymId,
              areaId: parsedInput.areaId,
            })
          }

          const routesInTargetArea = yield* routeRepository.findByAreaIds([
            parsedInput.areaId,
          ])
          if (
            routesInTargetArea.some(
              ({ id, order }) =>
                id !== parsedInput.routeId && order === parsedInput.order
            )
          ) {
            return yield* new GymRouteOrderAlreadyExistsError({
              areaId: parsedInput.areaId,
              order: parsedInput.order,
            })
          }

          const replacementImageUrl =
            parsedInput.routeImage === undefined
              ? Option.none()
              : Option.some(
                  yield* routeImageStorage.store({
                    routeId: parsedInput.routeId,
                    image: parsedInput.routeImage,
                  })
                )
          const imageUrl = Option.isSome(replacementImageUrl)
            ? replacementImageUrl
            : route.value.imageUrl

          const updated = yield* routeRepository.update(
            GymRoute.make({
              id: route.value.id,
              areaId: parsedInput.areaId,
              order: parsedInput.order,
              positionLabel: optionalPositionLabel(
                parsedInput.positionLabel
              ),
              setOn: parsedInput.setOn,
              setterName: optionalSetterName(parsedInput.setterName),
              boulderId: route.value.boulderId,
              imageUrl,
            })
          )

          if (Option.isNone(updated)) {
            if (Option.isSome(replacementImageUrl)) {
              yield* routeImageStorage
                .delete(replacementImageUrl.value)
                .pipe(Effect.catchDefect(() => Effect.void))
            }

            return yield* new GymRouteNotFoundError({
              gymId: parsedInput.gymId,
              routeId: parsedInput.routeId,
            })
          }

          if (
            Option.isSome(replacementImageUrl) &&
            Option.isSome(route.value.imageUrl) &&
            route.value.imageUrl.value !== replacementImageUrl.value
          ) {
            yield* routeImageStorage
              .delete(route.value.imageUrl.value)
              .pipe(Effect.catchDefect(() => Effect.void))
          }

          return updated.value
        }),
      }
    })
  )
}
