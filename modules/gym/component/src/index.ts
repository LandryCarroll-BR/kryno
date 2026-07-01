import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { ApplicationLayer } from "@gym/application"
import { CreateGymUseCase } from "@gym/application/use-cases/create-gym"
import { InfrastructureLayer } from "@gym/infrastructure"

export class Gym extends Service<
  Gym,
  {
    readonly createGym: CreateGymUseCase["Service"]["execute"]
  }
>()("@gym/component/Gym") {
  static Live = Layer.effect(
    Gym,
    Effect.gen(function* () {
      const createGym = yield* CreateGymUseCase

      return {
        createGym: createGym.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const GymLayer = Gym.Live.pipe(Layer.provide(ComponentLayer))
