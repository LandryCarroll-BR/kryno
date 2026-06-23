import { Effect, Layer, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import {
  Boulder,
  BoulderGrade,
  BoulderName,
  MovementStyle,
  WallAngle,
} from "../models/boulder.models"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { BoulderRepository } from "../repositories/boulder.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"
import { BoulderIdService } from "../services/boulder-id.service"

export const CreateBoulderInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  name: BoulderName,
  grade: BoulderGrade,
  wallAngle: WallAngle,
  movementStyle: MovementStyle,
}).annotate({ identifier: "CreateBoulderInput" })

export type CreateBoulderInput = typeof CreateBoulderInputSchema.Type

export class CreateBoulderUseCase extends Service<
  CreateBoulderUseCase,
  {
    readonly execute: (
      input: CreateBoulderInput
    ) => Effect.Effect<Boulder, SchemaError | UnauthenticatedClimberError>
  }
>()("@climbing/application/CreateBoulderUseCase") {
  static Live = Layer.effect(
    CreateBoulderUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const boulderIdService = yield* BoulderIdService
      const boulderRepository = yield* BoulderRepository

      return {
        execute: Effect.fn("CreateBoulderUseCase.execute")(function* (input) {
          const parsedInput = yield* Schema.decodeUnknownEffect(
            CreateBoulderInputSchema
          )(input, { errors: "all" })

          const creatorClimberId = yield* authenticatedClimber.resolve(
            parsedInput.token
          )
          const id = yield* boulderIdService.generate()

          return yield* boulderRepository.insert(
            Boulder.make({
              id,
              creatorClimberId,
              name: parsedInput.name,
              grade: parsedInput.grade,
              wallAngle: parsedInput.wallAngle,
              movementStyle: parsedInput.movementStyle,
            })
          )
        }),
      }
    })
  )
}
