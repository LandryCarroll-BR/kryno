import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@auth/infrastructure"

import { ApplicationLayer } from "@auth/application"
import { GetCurrentUserUseCase } from "@auth/application/use-cases/get-current-user"
import { SignInUseCase } from "@auth/application/use-cases/sign-in"
import { SignOutUseCase } from "@auth/application/use-cases/sign-out"
import { SignUpUseCase } from "@auth/application/use-cases/sign-up"
import { ValidateSessionUseCase } from "@auth/application/use-cases/validate-session"

export class Auth extends Service<
  Auth,
  {
    readonly signUp: SignUpUseCase["Service"]["execute"]
    readonly signIn: SignInUseCase["Service"]["execute"]
    readonly signOut: SignOutUseCase["Service"]["execute"]
    readonly validateSession: ValidateSessionUseCase["Service"]["execute"]
    readonly getCurrentUser: GetCurrentUserUseCase["Service"]["execute"]
  }
>()("@auth/component/Auth") {
  static Live = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const signUp = yield* SignUpUseCase
      const signIn = yield* SignInUseCase
      const signOut = yield* SignOutUseCase
      const validateSession = yield* ValidateSessionUseCase
      const getCurrentUser = yield* GetCurrentUserUseCase

      return {
        signUp: signUp.execute,
        signIn: signIn.execute,
        signOut: signOut.execute,
        validateSession: validateSession.execute,
        getCurrentUser: getCurrentUser.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ComponentLayer))
