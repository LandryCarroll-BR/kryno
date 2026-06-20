import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@auth/infrastructure"

import {
  SignUpUseCase,
  SignInUseCase,
  ValidateSessionUseCase,
  ApplicationLayer,
} from "@auth/application"

export class Auth extends Service<
  Auth,
  {
    readonly signUp: SignUpUseCase["Service"]["execute"]
    readonly signIn: SignInUseCase["Service"]["execute"]
    readonly validateSession: ValidateSessionUseCase["Service"]["execute"]
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

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ComponentLayer))
