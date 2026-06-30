import { Effect, Layer, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import {
  CreatedBoulderNotFoundError,
  UnauthorizedToDeleteBoulderError,
} from "../errors/boulder.errors"
import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { BoulderId, type Boulder } from "../models/boulder.models"
import { BoulderRepository } from "../repositories/boulder.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const DeleteBoulderInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  boulderId: BoulderId,
}).annotate({ identifier: "DeleteBoulderInput" })

export type DeleteBoulderInput = typeof DeleteBoulderInputSchema.Type
export type DeleteBoulderOutput = Boulder

export class DeleteBoulderUseCase extends Service<
  DeleteBoulderUseCase,
  {
    readonly execute: (
      input: DeleteBoulderInput
    ) => Effect.Effect<
      DeleteBoulderOutput,
      | SchemaError
      | UnauthenticatedClimberError
      | CreatedBoulderNotFoundError
      | UnauthorizedToDeleteBoulderError
    >
  }
>()("@climbing/application/DeleteBoulderUseCase") {
  static Live = Layer.effect(
    DeleteBoulderUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const boulderRepository = yield* BoulderRepository

      return {
        execute: Effect.fn("DeleteBoulderUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            DeleteBoulderInputSchema
          )(input, { errors: "all" })

          const creatorClimberId = yield* authenticatedClimber.resolve(
            parsedInput.token
          )
          const boulder = yield* boulderRepository.findById(
            parsedInput.boulderId
          )

          if (Option.isNone(boulder)) {
            return yield* new CreatedBoulderNotFoundError({
              climberId: creatorClimberId,
              boulderId: parsedInput.boulderId,
            })
          }

          if (boulder.value.creatorClimberId !== creatorClimberId) {
            return yield* new UnauthorizedToDeleteBoulderError({
              climberId: creatorClimberId,
              boulderId: parsedInput.boulderId,
            })
          }

          const deletedBoulder =
            yield* boulderRepository.deleteByCreatorClimberId(
              creatorClimberId,
              parsedInput.boulderId
            )

          if (Option.isNone(deletedBoulder)) {
            return yield* new CreatedBoulderNotFoundError({
              climberId: creatorClimberId,
              boulderId: parsedInput.boulderId,
            })
          }

          return deletedBoulder.value
        }),
      }
    })
  )
}
