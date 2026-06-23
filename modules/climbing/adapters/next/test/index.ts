export {}
import { Layer, ManagedRuntime } from "effect"
import { ClimbingTestLayer } from "@climbing/component/test"

import { PresenterLayer } from "../src/index"

export * from "../src/controllers/create-boulder.controller"
export * from "../src/controllers/end-climbing-session.controller"
export * from "../src/controllers/get-current-climbing-session.controller"
export * from "../src/controllers/start-climbing-session.controller"
export * from "../src/presenters/create-boulder.presenter"
export * from "../src/presenters/end-climbing-session.presenter"
export * from "../src/presenters/get-current-climbing-session.presenter"
export * from "../src/presenters/start-climbing-session.presenter"

export const AdapterTestLayer = Layer.mergeAll(
  ClimbingTestLayer,
  PresenterLayer
)

export const ClimbingAdapterTestRuntime =
  ManagedRuntime.make(AdapterTestLayer)
