import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"
import {
  BoulderGrade,
  BoulderId,
  BoulderName,
  BoulderColor,
  MovementStyle,
  WallAngle,
} from "@climbing/application/models/boulder"

import { GymAreaNotFoundError } from "../errors/gym-area.errors"
import {
  GymRouteBoulderAlreadyAssignedError,
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
  GymRouteImageUpload,
} from "../models/gym-route.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRouteRepository } from "../repositories/gym-route.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import {
  type AssignableGymBoulder,
  GymBoulderCatalog,
} from "../services/gym-boulder-catalog.service"
import { GymRouteImageStorage } from "../services/gym-route-image-storage.service"
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
const GymRouteBoulderSource = Schema.Literals(["existing", "new"])
export const CreateGymRouteInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  areaId: GymAreaId,
  order: Schema.optional(GymRouteOrderInput),
  positionLabel: OptionalTrimmedString,
  setOn: GymRouteSetDate,
  setterName: OptionalTrimmedString,
  boulderSource: Schema.optional(GymRouteBoulderSource),
  boulderId: Schema.optional(BoulderId),
  boulderGrade: Schema.optional(BoulderGrade),
  boulderColor: Schema.optional(BoulderColor),
  boulderWallAngle: Schema.optional(WallAngle),
  boulderMovementStyle: Schema.optional(MovementStyle),
  routeImage: Schema.optional(GymRouteImageUpload),
}).annotate({ identifier: "CreateGymRouteInput" })

const ExistingGymRouteBoulderInputSchema = Schema.Struct({
  boulderId: BoulderId,
}).annotate({ identifier: "ExistingGymRouteBoulderInput" })

const NewGymRouteBoulderInputSchema = Schema.Struct({
  boulderGrade: BoulderGrade,
  boulderColor: BoulderColor,
  boulderWallAngle: WallAngle,
  boulderMovementStyle: MovementStyle,
}).annotate({ identifier: "NewGymRouteBoulderInput" })

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

const boulderColorLabels = {
  UNSPECIFIED: "Unspecified",
  WHITE: "White",
  BLACK: "Black",
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green",
  BLUE: "Blue",
  PURPLE: "Purple",
  PINK: "Pink",
  GRAY: "Gray",
} satisfies Record<BoulderColor, string>

const deriveBoulderName = ({
  areaName,
  color,
  grade,
}: {
  readonly areaName: string
  readonly color: BoulderColor
  readonly grade: BoulderGrade
}): BoulderName =>
  BoulderName.make(`${areaName} ${boulderColorLabels[color]} ${grade}`)

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
      | GymRouteBoulderAlreadyAssignedError
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
      const routeImageStorage = yield* GymRouteImageStorage
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

          const routesInArea = yield* routeRepository.findByAreaIds([
            parsedInput.areaId,
          ])
          const routeOrder =
            parsedInput.order ??
            GymRouteOrder.make(
              routesInArea.reduce(
                (max, route) => Math.max(max, route.order),
                0
              ) + 1
            )

          if (routesInArea.some(({ order }) => order === routeOrder)) {
            return yield* new GymRouteOrderAlreadyExistsError({
              areaId: parsedInput.areaId,
              order: routeOrder,
            })
          }

          let createdBoulder: AssignableGymBoulder | null = null
          let boulderId: BoulderId

          if ((parsedInput.boulderSource ?? "existing") === "new") {
            const boulderInput = yield* Schema.decodeUnknownEffect(
              NewGymRouteBoulderInputSchema
            )(parsedInput, { errors: "all" })
            createdBoulder = yield* boulderCatalog.createOwned({
              token: parsedInput.token,
              name: deriveBoulderName({
                areaName: area.value.name,
                color: boulderInput.boulderColor,
                grade: boulderInput.boulderGrade,
              }),
              grade: boulderInput.boulderGrade,
              color: boulderInput.boulderColor,
              wallAngle: boulderInput.boulderWallAngle,
              movementStyle: boulderInput.boulderMovementStyle,
            })
            boulderId = createdBoulder.id
          } else {
            const boulderInput = yield* Schema.decodeUnknownEffect(
              ExistingGymRouteBoulderInputSchema
            )(parsedInput, { errors: "all" })
            const ownedBoulders = yield* boulderCatalog.listOwned(
              parsedInput.token
            )

            if (
              !ownedBoulders.some(({ id }) => id === boulderInput.boulderId)
            ) {
              return yield* new GymRouteBoulderNotAssignableError({
                boulderId: boulderInput.boulderId,
              })
            }

            if (
              (
                yield* routeRepository.findByBoulderIds([
                  boulderInput.boulderId,
                ])
              ).length > 0
            ) {
              return yield* new GymRouteBoulderAlreadyAssignedError({
                boulderId: boulderInput.boulderId,
              })
            }

            boulderId = boulderInput.boulderId
          }

          const id = yield* routeIdService.generate()
          const imageUrl =
            parsedInput.routeImage === undefined
              ? Option.none()
              : Option.some(
                  yield* routeImageStorage.store({
                    routeId: id,
                    image: parsedInput.routeImage,
                  })
                )
          const inserted = yield* routeRepository.insert(
            GymRoute.make({
              id,
              areaId: parsedInput.areaId,
              order: routeOrder,
              positionLabel: optionalPositionLabel(
                parsedInput.positionLabel
              ),
              setOn: parsedInput.setOn,
              setterName: optionalSetterName(parsedInput.setterName),
              boulderId,
              imageUrl,
            })
          )

          if (Option.isNone(inserted)) {
            if (Option.isSome(imageUrl)) {
              yield* routeImageStorage
                .delete(imageUrl.value)
                .pipe(Effect.catchDefect(() => Effect.void))
            }

            if (createdBoulder !== null) {
              yield* boulderCatalog.deleteOwned({
                token: parsedInput.token,
                boulderId: createdBoulder.id,
              })
            }

            if (
              (
                yield* routeRepository.findByBoulderIds([boulderId])
              ).length > 0
            ) {
              return yield* new GymRouteBoulderAlreadyAssignedError({
                boulderId,
              })
            }

            return yield* new GymRouteOrderAlreadyExistsError({
              areaId: parsedInput.areaId,
              order: routeOrder,
            })
          }

          return inserted.value
        }),
      }
    })
  )
}
