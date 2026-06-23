import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@climbing/infrastructure"

import {
  ApplicationLayer,
  CreateBoulderUseCase,
  EndClimbingSessionUseCase,
  GetCurrentClimbingSessionUseCase,
  StartClimbingSessionUseCase,
} from "@climbing/application"

export class Climbing extends Service<
  Climbing,
  {
    readonly createBoulder: CreateBoulderUseCase["Service"]["execute"]
    readonly endClimbingSession: EndClimbingSessionUseCase["Service"]["execute"]
    readonly getCurrentClimbingSession: GetCurrentClimbingSessionUseCase["Service"]["execute"]
    readonly startClimbingSession: StartClimbingSessionUseCase["Service"]["execute"]
  }
>()("@climbing/component/Climbing") {
  static Live = Layer.effect(
    Climbing,
    Effect.gen(function* () {
      const createBoulder = yield* CreateBoulderUseCase
      const endClimbingSession = yield* EndClimbingSessionUseCase
      const getCurrentClimbingSession = yield* GetCurrentClimbingSessionUseCase
      const startClimbingSession = yield* StartClimbingSessionUseCase
      return {
        createBoulder: createBoulder.execute,
        endClimbingSession: endClimbingSession.execute,
        getCurrentClimbingSession: getCurrentClimbingSession.execute,
        startClimbingSession: startClimbingSession.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const ClimbingLayer = Climbing.Live.pipe(Layer.provide(ComponentLayer))
