import { Layer, ManagedRuntime } from "effect"
import { ClimbingLayer } from "@climbing/component"

import { CreateBoulderPresenter } from "./presenters/create-boulder.presenter"
import { EndClimbingSessionPresenter } from "./presenters/end-climbing-session.presenter"
import { GetCurrentClimbingSessionPresenter } from "./presenters/get-current-climbing-session.presenter"
import { ListCreatedBouldersPresenter } from "./presenters/list-created-boulders.presenter"
import { LogBoulderAttemptPresenter } from "./presenters/log-boulder-attempt.presenter"
import { StartClimbingSessionPresenter } from "./presenters/start-climbing-session.presenter"

export const PresenterLayer = Layer.mergeAll(
  CreateBoulderPresenter.Live,
  EndClimbingSessionPresenter.Live,
  GetCurrentClimbingSessionPresenter.Live,
  ListCreatedBouldersPresenter.Live,
  LogBoulderAttemptPresenter.Live,
  StartClimbingSessionPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(ClimbingLayer, PresenterLayer)

export const ClimbingAdapterRuntime = ManagedRuntime.make(AdapterLayer)
