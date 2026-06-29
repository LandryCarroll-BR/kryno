import { Effect, Layer, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { Boulder } from "../models/boulder.models"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { BoulderRepository } from "../repositories/boulder.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const ListCreatedBouldersInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "ListCreatedBouldersInput" })

export type ListCreatedBouldersInput =
  typeof ListCreatedBouldersInputSchema.Type
export type ListCreatedBouldersOutput = readonly Boulder[]

export class ListCreatedBouldersUseCase extends Service<
  ListCreatedBouldersUseCase,
  {
    readonly execute: (
      input: ListCreatedBouldersInput
    ) => Effect.Effect<
      ListCreatedBouldersOutput,
      SchemaError | UnauthenticatedClimberError
    >
  }
>()("@climbing/application/ListCreatedBouldersUseCase") {
  static Live = Layer.effect(
    ListCreatedBouldersUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const boulderRepository = yield* BoulderRepository

      return {
        execute: Effect.fn("ListCreatedBouldersUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              ListCreatedBouldersInputSchema
            )(input, { errors: "all" })

            const creatorClimberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )

            return yield* boulderRepository.findByCreatorClimberId(
              creatorClimberId
            )
          }
        ),
      }
    })
  )
}
