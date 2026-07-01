import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { ApplicationLayer } from "@gym/application"
import { CreateGymUseCase } from "@gym/application/use-cases/create-gym"
import { JoinGymUseCase } from "@gym/application/use-cases/join-gym"
import { ListGymsUseCase } from "@gym/application/use-cases/list-gyms"
import { InfrastructureLayer } from "@gym/infrastructure"

export class Gym extends Service<
  Gym,
  {
    readonly createGym: CreateGymUseCase["Service"]["execute"]
    readonly joinGym: JoinGymUseCase["Service"]["execute"]
    readonly listGyms: ListGymsUseCase["Service"]["execute"]
  }
>()("@gym/component/Gym") {
  static Live = Layer.effect(
    Gym,
    Effect.gen(function* () {
      const createGym = yield* CreateGymUseCase
      const joinGym = yield* JoinGymUseCase
      const listGyms = yield* ListGymsUseCase

      return {
        createGym: createGym.execute,
        joinGym: joinGym.execute,
        listGyms: listGyms.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const GymLayer = Gym.Live.pipe(Layer.provide(ComponentLayer))
