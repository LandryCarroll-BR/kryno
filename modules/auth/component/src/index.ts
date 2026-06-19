import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { SignUpUseCase, SignInUseCase } from "@auth/application"
import { InfrastructureLayer } from "@auth/infrastructure"

export class Auth extends Service<
  Auth,
  {
    signUp: SignUpUseCase["Service"]["execute"]
    signIn: SignInUseCase["Service"]["execute"]
  }
>()("@auth/component/index/auth") {
  static Live = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const signUp = yield* SignUpUseCase
      const signIn = yield* SignInUseCase
      return {
        signUp: signUp.execute,
        signIn: signIn.execute,
      }
    })
  )
}

const ApplicationLayer = Layer.provideMerge(
  Layer.mergeAll(SignUpUseCase.Live, SignInUseCase.Live),
  InfrastructureLayer
)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ApplicationLayer))
