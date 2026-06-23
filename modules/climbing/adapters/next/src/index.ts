import { Layer, ManagedRuntime } from "effect"
import { ClimbingLayer } from "@climbing/component"

import { CreateBoulderPresenter } from "./presenters/create-boulder.presenter"
import { EndClimbingSessionPresenter } from "./presenters/end-climbing-session.presenter"
import { GetCurrentClimbingSessionPresenter } from "./presenters/get-current-climbing-session.presenter"
import { ListCreatedBouldersPresenter } from "./presenters/list-created-boulders.presenter"
import { StartClimbingSessionPresenter } from "./presenters/start-climbing-session.presenter"

export * from "./controllers/create-boulder.controller"
export * from "./controllers/end-climbing-session.controller"
export * from "./controllers/get-current-climbing-session.controller"
export * from "./controllers/list-created-boulders.controller"
export * from "./controllers/start-climbing-session.controller"

export * from "./presenters/create-boulder.presenter"
export * from "./presenters/end-climbing-session.presenter"
export * from "./presenters/get-current-climbing-session.presenter"
export * from "./presenters/list-created-boulders.presenter"
export * from "./presenters/start-climbing-session.presenter"

export const PresenterLayer = Layer.mergeAll(
  CreateBoulderPresenter.Live,
  EndClimbingSessionPresenter.Live,
  GetCurrentClimbingSessionPresenter.Live,
  ListCreatedBouldersPresenter.Live,
  StartClimbingSessionPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(ClimbingLayer, PresenterLayer)

export const ClimbingAdapterRuntime = ManagedRuntime.make(AdapterLayer)
