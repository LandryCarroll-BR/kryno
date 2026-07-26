import { Effect, Layer, Match, Option, Schema } from "effect"
import { Service } from "effect/Context"
import type { SchemaError } from "effect/Schema"

import {
  BoulderId,
  type BoulderId as BoulderIdType,
} from "../models/boulder.models"
import type { ClimbingAttempt } from "../models/climbing-attempt.models"
import type { ClimbingSessionId } from "../models/climbing-session.models"
import type { UnauthenticatedClimberError } from "../errors/climber.errors"
import { ClimbingSessionRepository } from "../repositories/climbing-session.repository"
import { AuthenticatedClimber } from "../services/authenticated-climber.service"

export const ListBoulderAttemptHistoryInputSchema = Schema.Struct({
  token: Schema.NonEmptyString,
  boulderIds: Schema.Array(BoulderId),
}).annotate({ identifier: "ListBoulderAttemptHistoryInput" })

export type ListBoulderAttemptHistoryInput =
  typeof ListBoulderAttemptHistoryInputSchema.Type

export type BoulderAttemptHistorySession = {
  readonly id: ClimbingSessionId
  readonly startedAt: Date
  readonly endedAt: Option.Option<Date>
  readonly attempts: readonly ClimbingAttempt[]
}

export type BoulderAttemptHistory = {
  readonly boulderId: BoulderIdType
  readonly sessions: readonly BoulderAttemptHistorySession[]
}

export type ListBoulderAttemptHistoryOutput = readonly BoulderAttemptHistory[]

export class ListBoulderAttemptHistoryUseCase extends Service<
  ListBoulderAttemptHistoryUseCase,
  {
    readonly execute: (
      input: ListBoulderAttemptHistoryInput
    ) => Effect.Effect<
      ListBoulderAttemptHistoryOutput,
      SchemaError | UnauthenticatedClimberError
    >
  }
>()("@climbing/application/ListBoulderAttemptHistoryUseCase") {
  static Live = Layer.effect(
    ListBoulderAttemptHistoryUseCase,
    Effect.gen(function* () {
      const authenticatedClimber = yield* AuthenticatedClimber
      const sessionRepository = yield* ClimbingSessionRepository

      return {
        execute: Effect.fn("ListBoulderAttemptHistoryUseCase.execute")(
          function* (input) {
            const parsedInput = yield* Schema.decodeUnknownEffect(
              ListBoulderAttemptHistoryInputSchema
            )(input, { errors: "all" })
            const climberId = yield* authenticatedClimber.resolve(
              parsedInput.token
            )
            const sessions =
              yield* sessionRepository.findAllByClimberId(climberId)
            const boulderIds = [...new Set(parsedInput.boulderIds)]

            return boulderIds.map((boulderId) => ({
              boulderId,
              sessions: sessions.flatMap((session) => {
                const attempts = session.attempts.filter(
                  (attempt) => attempt.boulderId === boulderId
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
