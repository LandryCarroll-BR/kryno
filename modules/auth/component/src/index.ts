import {
  IdentityServiceLive,
  SessionInMemoryRepository,
  SessionServiceLive,
  UserInMemoryRepository,
  UserServiceLive,
} from "@auth/infrastructure"

import { SignUpInputBoundary, SignUpInteractor } from "@auth/application"
import { Effect, Layer } from "effect"
import { Service } from "effect/Context"

export class Auth extends Service<
  Auth,
  {
    signUp: SignUpInputBoundary["Service"]["execute"]
  }
>()("@auth/component/index/auth") {
  static Live = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const signUp = yield* SignUpInputBoundary
      return {
        signUp: signUp.execute,
      }
    })
  )
}

const InfrastructureLayers = Layer.mergeAll(
  IdentityServiceLive,
  SessionInMemoryRepository,
  SessionServiceLive,
  UserInMemoryRepository,
  UserServiceLive
)

const ApplicationLayers = Layer.provideMerge(
  SignUpInteractor,
  InfrastructureLayers
)

export const AuthLayer = Auth.Live.pipe(Layer.provide(ApplicationLayers))
