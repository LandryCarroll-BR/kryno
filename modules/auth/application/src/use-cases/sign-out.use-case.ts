import { Layer, Effect, Option, Schema } from "effect"
import { Service } from "effect/Context"
import { SessionRepository } from "../repositories/session.repository"
import { ValidateSessionFactory } from "../factories/validate-session.factory"

export const SignOutInputSchema = Schema.Struct({
  token: Schema.String,
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
      const validateSession = yield* ValidateSessionFactory

      return {
        execute: Effect.fn("SignOutUseCase.execute")(
          function* (input) {
            const session = yield* validateSession(input)

            if (Option.isNone(session)) {
              return yield* Effect.void
            }

            yield* sessionRepository.delete(session.value.id)
          },
          Effect.catchTags({
            InvalidSessionSecretHashError: () => Effect.void,
            InvalidSessionTokenError: () => Effect.void,
            SessionNotFoundError: () => Effect.void,
          })
        ),
      }
    })
  )
}
