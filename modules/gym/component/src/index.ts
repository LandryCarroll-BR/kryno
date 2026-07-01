import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { ApplicationLayer } from "@gym/application"
import { CreateGymUseCase } from "@gym/application/use-cases/create-gym"
import { CreateGymAreaUseCase } from "@gym/application/use-cases/create-gym-area"
import { CreateGymRouteUseCase } from "@gym/application/use-cases/create-gym-route"
import { GetGymManagementUseCase } from "@gym/application/use-cases/get-gym-management"
import { JoinGymUseCase } from "@gym/application/use-cases/join-gym"
import { ListGymsUseCase } from "@gym/application/use-cases/list-gyms"
import { InfrastructureLayer } from "@gym/infrastructure"

export class Gym extends Service<
  Gym,
  {
    readonly createGym: CreateGymUseCase["Service"]["execute"]
    readonly createGymArea: CreateGymAreaUseCase["Service"]["execute"]
    readonly createGymRoute: CreateGymRouteUseCase["Service"]["execute"]
    readonly getGymManagement: GetGymManagementUseCase["Service"]["execute"]
    readonly joinGym: JoinGymUseCase["Service"]["execute"]
    readonly listGyms: ListGymsUseCase["Service"]["execute"]
  }
>()("@gym/component/Gym") {
  static Live = Layer.effect(
    Gym,
    Effect.gen(function* () {
      const createGym = yield* CreateGymUseCase
      const createGymArea = yield* CreateGymAreaUseCase
      const createGymRoute = yield* CreateGymRouteUseCase
      const getGymManagement = yield* GetGymManagementUseCase
      const joinGym = yield* JoinGymUseCase
      const listGyms = yield* ListGymsUseCase

      return {
        createGym: createGym.execute,
        createGymArea: createGymArea.execute,
        createGymRoute: createGymRoute.execute,
        getGymManagement: getGymManagement.execute,
        joinGym: joinGym.execute,
        listGyms: listGyms.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const GymLayer = Gym.Live.pipe(Layer.provide(ComponentLayer))
