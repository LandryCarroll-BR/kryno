import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { GymAreaNameAlreadyExistsError } from "../errors/gym-area.errors"
import type {
  UnauthenticatedGymAdministratorError,
  UnauthorizedGymAdministratorError,
} from "../errors/gym.errors"
import { GymNotFoundError } from "../errors/gym-membership.errors"
import { GymArea, GymAreaName } from "../models/gym-area.models"
import { GymId } from "../models/gym.models"
import { GymAreaRepository } from "../repositories/gym-area.repository"
import { GymRepository } from "../repositories/gym.repository"
import { GymAdministratorAuthorization } from "../services/gym-administrator-authorization.service"
import { GymAreaIdService } from "../services/gym-area-id.service"

export const CreateGymAreaInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  gymId: GymId,
  name: GymAreaName,
}).annotate({ identifier: "CreateGymAreaInput" })

export type CreateGymAreaInput = typeof CreateGymAreaInputSchema.Type
export type CreateGymAreaOutput = GymArea

export class CreateGymAreaUseCase extends Service<
  CreateGymAreaUseCase,
  {
    readonly execute: (
      input: CreateGymAreaInput
    ) => Effect.Effect<
      CreateGymAreaOutput,
      | SchemaError
      | UnauthenticatedGymAdministratorError
      | UnauthorizedGymAdministratorError
      | GymNotFoundError
      | GymAreaNameAlreadyExistsError
    >
  }
>()("@gym/application/CreateGymAreaUseCase") {
  static Live = Layer.effect(
    CreateGymAreaUseCase,
    Effect.gen(function* () {
      const authorization = yield* GymAdministratorAuthorization
      const gymRepository = yield* GymRepository
      const areaRepository = yield* GymAreaRepository
      const areaIdService = yield* GymAreaIdService

      return {
        execute: Effect.fn("CreateGymAreaUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            CreateGymAreaInputSchema
          )(input, { errors: "all" })

          yield* authorization.authorize(parsedInput.token)

          if (
            Option.isNone(
              yield* gymRepository.findById(parsedInput.gymId)
            )
          ) {
            return yield* new GymNotFoundError({ gymId: parsedInput.gymId })
          }

          const id = yield* areaIdService.generate()
          const inserted = yield* areaRepository.insert(
            GymArea.make({
              id,
              gymId: parsedInput.gymId,
              name: parsedInput.name,
            })
          )

          if (Option.isNone(inserted)) {
            return yield* new GymAreaNameAlreadyExistsError({
              gymId: parsedInput.gymId,
              name: parsedInput.name,
            })
          }

          return inserted.value
        }),
      }
    })
  )
}
