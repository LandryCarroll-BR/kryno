import { Effect, Layer, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import { BoulderId, type Boulder } from "../models/boulder.models"
import { BoulderRepository } from "../repositories/boulder.repository"

export const GetBouldersByIdsInputSchema = Schema.Struct({
  boulderIds: Schema.Array(BoulderId),
}).annotate({ identifier: "GetBouldersByIdsInput" })

export type GetBouldersByIdsInput =
  typeof GetBouldersByIdsInputSchema.Type
export type GetBouldersByIdsOutput = readonly Boulder[]

export class GetBouldersByIdsUseCase extends Service<
  GetBouldersByIdsUseCase,
  {
    readonly execute: (
      input: GetBouldersByIdsInput
    ) => Effect.Effect<GetBouldersByIdsOutput, SchemaError>
  }
>()("@climbing/application/GetBouldersByIdsUseCase") {
  static Live = Layer.effect(
    GetBouldersByIdsUseCase,
    Effect.gen(function* () {
      const boulderRepository = yield* BoulderRepository

      return {
        execute: Effect.fn("GetBouldersByIdsUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              GetBouldersByIdsInputSchema
            )(input, { errors: "all" })

            return yield* boulderRepository.findByIds(
              parsedInput.boulderIds
            )
          }
        ),
      }
    })
  )
}
