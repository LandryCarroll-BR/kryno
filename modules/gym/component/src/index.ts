import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { ApplicationLayer } from "@gym/application"
import { CreateGymUseCase } from "@gym/application/use-cases/create-gym"
import { CreateGymAreaUseCase } from "@gym/application/use-cases/create-gym-area"
import { CreateGymRouteUseCase } from "@gym/application/use-cases/create-gym-route"
import { DeleteGymRouteUseCase } from "@gym/application/use-cases/delete-gym-route"
import { GetGymManagementUseCase } from "@gym/application/use-cases/get-gym-management"
import { GetGymRoutesUseCase } from "@gym/application/use-cases/get-gym-routes"
import { JoinGymUseCase } from "@gym/application/use-cases/join-gym"
import { ListGymRouteAttemptHistoryUseCase } from "@gym/application/use-cases/list-gym-route-attempt-history"
import { ListGymsUseCase } from "@gym/application/use-cases/list-gyms"
import { LogGymRouteAttemptUseCase } from "@gym/application/use-cases/log-gym-route-attempt"
import { InfrastructureLayer } from "@gym/infrastructure"

export class Gym extends Service<
  Gym,
  {
    readonly createGym: CreateGymUseCase["Service"]["execute"]
    readonly createGymArea: CreateGymAreaUseCase["Service"]["execute"]
    readonly createGymRoute: CreateGymRouteUseCase["Service"]["execute"]
    readonly deleteGymRoute: DeleteGymRouteUseCase["Service"]["execute"]
    readonly getGymManagement: GetGymManagementUseCase["Service"]["execute"]
    readonly getGymRoutes: GetGymRoutesUseCase["Service"]["execute"]
    readonly joinGym: JoinGymUseCase["Service"]["execute"]
    readonly listGymRouteAttemptHistory: ListGymRouteAttemptHistoryUseCase["Service"]["execute"]
    readonly listGyms: ListGymsUseCase["Service"]["execute"]
    readonly logGymRouteAttempt: LogGymRouteAttemptUseCase["Service"]["execute"]
  }
>()("@gym/component/Gym") {
  static Live = Layer.effect(
    Gym,
    Effect.gen(function* () {
      const createGym = yield* CreateGymUseCase
      const createGymArea = yield* CreateGymAreaUseCase
      const createGymRoute = yield* CreateGymRouteUseCase
      const deleteGymRoute = yield* DeleteGymRouteUseCase
      const getGymManagement = yield* GetGymManagementUseCase
      const getGymRoutes = yield* GetGymRoutesUseCase
      const joinGym = yield* JoinGymUseCase
      const listGymRouteAttemptHistory =
        yield* ListGymRouteAttemptHistoryUseCase
      const listGyms = yield* ListGymsUseCase
      const logGymRouteAttempt = yield* LogGymRouteAttemptUseCase

      return {
        createGym: createGym.execute,
        createGymArea: createGymArea.execute,
        createGymRoute: createGymRoute.execute,
        deleteGymRoute: deleteGymRoute.execute,
        getGymManagement: getGymManagement.execute,
        getGymRoutes: getGymRoutes.execute,
        joinGym: joinGym.execute,
        listGymRouteAttemptHistory: listGymRouteAttemptHistory.execute,
        listGyms: listGyms.execute,
        logGymRouteAttempt: logGymRouteAttempt.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const GymLayer = Gym.Live.pipe(Layer.provide(ComponentLayer))
