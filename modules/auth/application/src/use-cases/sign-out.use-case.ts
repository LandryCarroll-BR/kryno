import { Layer, Effect, Schema } from "effect"
import { Service } from "effect/Context"
import { SessionId } from "../models/session.models"
import { SessionRepository } from "../repositories/session.repository"

export const SignOutInputSchema = Schema.Struct({
  sessionId: Schema.NonEmptyString,
}).annotate({ identifier: "SignOutInput" })

export type SignOutInput = typeof SignOutInputSchema.Type

export class SignOutUseCase extends Service<
  SignOutUseCase,
  {
    readonly execute: (input: SignOutInput) => Effect.Effect<void>
  }
>()("@auth/application/SignOutUseCase") {
  static Live = Layer.effect(
    SignOutUseCase,
    Effect.gen(function* () {
      const sessionRepository = yield* SessionRepository
      return {
        execute: Effect.fn("SignOutUseCase.execute")(function* (input) {
          const sessionId = SessionId.make(input.sessionId)
          return yield* sessionRepository.delete(sessionId)
        }),
      }
    })
  )
}
