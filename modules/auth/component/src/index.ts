import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { SignUpUseCase } from "@auth/application"
import { InfrastructureLayer } from "@auth/infrastructure"

export class Auth extends Service<
  Auth,
  {
    signUp: SignUpUseCase["Service"]["execute"]
  }
>()("@auth/component/index/auth") {
  static Live = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const signUp = yield* SignUpUseCase
      return {
        signUp: signUp.execute,
      }
    })
  )
}

const ApplicationLayer = Layer.provideMerge(
  SignUpUseCase.Live,
  InfrastructureLayer
)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ApplicationLayer))
