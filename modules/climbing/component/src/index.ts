import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import { InfrastructureLayer } from "@climbing/infrastructure"

import { ApplicationLayer } from "@climbing/application"
import { CreateBoulderUseCase } from "@climbing/application/use-cases/create-boulder"
import { DeleteBoulderUseCase } from "@climbing/application/use-cases/delete-boulder"
import { EndClimbingSessionUseCase } from "@climbing/application/use-cases/end-climbing-session"
import { GetBouldersByIdsUseCase } from "@climbing/application/use-cases/get-boulders-by-ids"
import { GetCurrentClimbingSessionUseCase } from "@climbing/application/use-cases/get-current-climbing-session"
import { ListCreatedBouldersUseCase } from "@climbing/application/use-cases/list-created-boulders"
import { LogBoulderAttemptUseCase } from "@climbing/application/use-cases/log-boulder-attempt"
import { LogExistingBoulderAttemptUseCase } from "@climbing/application/use-cases/log-existing-boulder-attempt"
import { StartClimbingSessionUseCase } from "@climbing/application/use-cases/start-climbing-session"

export class Climbing extends Service<
  Climbing,
  {
    readonly createBoulder: CreateBoulderUseCase["Service"]["execute"]
    readonly deleteBoulder: DeleteBoulderUseCase["Service"]["execute"]
    readonly endClimbingSession: EndClimbingSessionUseCase["Service"]["execute"]
    readonly getBouldersByIds: GetBouldersByIdsUseCase["Service"]["execute"]
    readonly getCurrentClimbingSession: GetCurrentClimbingSessionUseCase["Service"]["execute"]
    readonly listCreatedBoulders: ListCreatedBouldersUseCase["Service"]["execute"]
    readonly logBoulderAttempt: LogBoulderAttemptUseCase["Service"]["execute"]
    readonly logExistingBoulderAttempt: LogExistingBoulderAttemptUseCase["Service"]["execute"]
    readonly startClimbingSession: StartClimbingSessionUseCase["Service"]["execute"]
  }
>()("@climbing/component/Climbing") {
  static Live = Layer.effect(
    Climbing,
    Effect.gen(function* () {
      const createBoulder = yield* CreateBoulderUseCase
      const deleteBoulder = yield* DeleteBoulderUseCase
      const endClimbingSession = yield* EndClimbingSessionUseCase
      const getBouldersByIds = yield* GetBouldersByIdsUseCase
      const getCurrentClimbingSession = yield* GetCurrentClimbingSessionUseCase
      const listCreatedBoulders = yield* ListCreatedBouldersUseCase
      const logBoulderAttempt = yield* LogBoulderAttemptUseCase
      const logExistingBoulderAttempt =
        yield* LogExistingBoulderAttemptUseCase
      const startClimbingSession = yield* StartClimbingSessionUseCase

      return {
        createBoulder: createBoulder.execute,
        deleteBoulder: deleteBoulder.execute,
        endClimbingSession: endClimbingSession.execute,
        getBouldersByIds: getBouldersByIds.execute,
        getCurrentClimbingSession: getCurrentClimbingSession.execute,
        listCreatedBoulders: listCreatedBoulders.execute,
        logBoulderAttempt: logBoulderAttempt.execute,
        logExistingBoulderAttempt: logExistingBoulderAttempt.execute,
        startClimbingSession: startClimbingSession.execute,
      }
    })
  )
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const ClimbingLayer = Climbing.Live.pipe(Layer.provide(ComponentLayer))
