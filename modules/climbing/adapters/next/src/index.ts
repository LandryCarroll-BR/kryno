import { Layer, ManagedRuntime } from "effect"
import { ClimbingLayer } from "@climbing/component"

import { StartClimbingSessionPresenter } from "./presenters/start-climbing-session.presenter"

export * from "./controllers/start-climbing-session.controller"
export * from "./presenters/start-climbing-session.presenter"

export const PresenterLayer = Layer.mergeAll(
  StartClimbingSessionPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(
  ClimbingLayer,
  PresenterLayer
)

export const ClimbingAdapterRuntime = ManagedRuntime.make(AdapterLayer)
