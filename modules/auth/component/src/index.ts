import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@auth/infrastructure"

import {
  SignUpUseCase,
  SignInUseCase,
  ValidateSessionUseCase,
} from "@auth/application"

export class Auth extends Service<
  Auth,
  {
    signUp: SignUpUseCase["Service"]["execute"]
    signIn: SignInUseCase["Service"]["execute"]
    validateSession: ValidateSessionUseCase["Service"]["execute"]
  }
>()("@auth/component/Auth") {
  static Live = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const signUp = yield* SignUpUseCase
      const signIn = yield* SignInUseCase
      const validateSession = yield* ValidateSessionUseCase

      return {
        signUp: signUp.execute,
        signIn: signIn.execute,
        validateSession: validateSession.execute,
      }
    })
  )
}

const ApplicationLayer = Layer.provideMerge(
  Layer.mergeAll(
    SignUpUseCase.Live,
    SignInUseCase.Live,
    ValidateSessionUseCase.Live
  ),
  InfrastructureLayer
)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ApplicationLayer))
