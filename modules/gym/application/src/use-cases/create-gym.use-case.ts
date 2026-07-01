import { Effect, Layer, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type {
  UnauthenticatedGymCreatorError,
  UnauthorizedGymCreatorError,
} from "../errors/gym.errors"

import { Gym, GymName } from "../models/gym.models"
import { GymRepository } from "../repositories/gym.repository"
import { GymCreatorAuthorization } from "../services/gym-creator-authorization.service"
import { GymIdService } from "../services/gym-id.service"

export const CreateGymInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  name: GymName,
}).annotate({ identifier: "CreateGymInput" })

export type CreateGymInput = typeof CreateGymInputSchema.Type
export type CreateGymOutput = Gym

export class CreateGymUseCase extends Service<
  CreateGymUseCase,
  {
    readonly execute: (
      input: CreateGymInput
    ) => Effect.Effect<
      CreateGymOutput,
      SchemaError | UnauthenticatedGymCreatorError | UnauthorizedGymCreatorError
    >
  }
>()("@gym/application/CreateGymUseCase") {
  static Live = Layer.effect(
    CreateGymUseCase,
    Effect.gen(function* () {
      const gymCreatorAuthorization = yield* GymCreatorAuthorization
      const gymIdService = yield* GymIdService
      const gymRepository = yield* GymRepository

      return {
        execute: Effect.fn("CreateGymUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            CreateGymInputSchema
          )(input, { errors: "all" })

          yield* gymCreatorAuthorization.authorize(parsedInput.token)
          const id = yield* gymIdService.generate()

          return yield* gymRepository.insert(
            Gym.make({
              id,
              name: parsedInput.name,
            })
          )
        }),
      }
    })
  )
}
