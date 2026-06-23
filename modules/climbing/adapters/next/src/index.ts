import { Layer, ManagedRuntime } from "effect"
import { ClimbingLayer } from "@climbing/component"

import { EndClimbingSessionPresenter } from "./presenters/end-climbing-session.presenter"
import { GetCurrentClimbingSessionPresenter } from "./presenters/get-current-climbing-session.presenter"
import { StartClimbingSessionPresenter } from "./presenters/start-climbing-session.presenter"

export * from "./controllers/end-climbing-session.controller"
export * from "./controllers/get-current-climbing-session.controller"
export * from "./controllers/start-climbing-session.controller"
export * from "./presenters/end-climbing-session.presenter"
export * from "./presenters/get-current-climbing-session.presenter"
export * from "./presenters/start-climbing-session.presenter"

export const PresenterLayer = Layer.mergeAll(
  EndClimbingSessionPresenter.Live,
  GetCurrentClimbingSessionPresenter.Live,
  StartClimbingSessionPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(
  ClimbingLayer,
  PresenterLayer
)

export const ClimbingAdapterRuntime = ManagedRuntime.make(AdapterLayer)
