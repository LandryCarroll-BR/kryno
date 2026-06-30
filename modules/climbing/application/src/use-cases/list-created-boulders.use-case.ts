import { Effect, Layer, Match, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import type { Boulder } from "../models/boulder.models"
import type { ClimbingAttempt } from "../models/climbing-attempt.models"
import type { ClimbingSessionId } from "../models/climbing-session.models"

import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { BoulderRepository } from "../repositories/boulder.repository"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const ListCreatedBouldersInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
}).annotate({ identifier: "ListCreatedBouldersInput" })

export type ListCreatedBouldersInput =
  typeof ListCreatedBouldersInputSchema.Type

export type CreatedBoulderAttemptSession = {
  readonly id: ClimbingSessionId
  readonly startedAt: Date
  readonly endedAt: Option.Option<Date>
  readonly attempts: readonly ClimbingAttempt[]
}

export type CreatedBoulderWithAttemptHistory = {
  readonly boulder: Boulder
  readonly sessions: readonly CreatedBoulderAttemptSession[]
}

export type ListCreatedBouldersOutput =
  readonly CreatedBoulderWithAttemptHistory[]

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
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        execute: Effect.fn("ListCreatedBouldersUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              ListCreatedBouldersInputSchema
            )(input, { errors: "all" })

            const creatorClimberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )

            const boulders =
              yield* boulderRepository.findByCreatorClimberId(creatorClimberId)
            const sessions =
              yield* sessionRepository.findAllByClimberId(creatorClimberId)

            return boulders.map((boulder) => ({
              boulder,
              sessions: sessions.flatMap((session) => {
                const attempts = session.attempts.filter(
                  (attempt) => attempt.boulderId === boulder.id
                )

                if (attempts.length === 0) {
                  return []
                }

                return [
                  {
                    id: session.id,
                    startedAt: session.startedAt,
                    endedAt: Match.value(session).pipe(
                      Match.tag("ActiveClimbingSession", () => Option.none()),
                      Match.tag("CompletedClimbingSession", ({ endedAt }) =>
                        Option.some(endedAt)
                      ),
                      Match.exhaustive
                    ),
                    attempts,
                  },
                ]
              }),
            }))
          }
        ),
      }
    })
  )
}
