export {}
import { Layer, ManagedRuntime } from "effect"
import { ClimbingTestLayer } from "@climbing/component/test"

import { PresenterLayer } from "../src/index"

export * from "../src/controllers/start-climbing-session.controller"
export * from "../src/presenters/start-climbing-session.presenter"

export const AdapterTestLayer = Layer.mergeAll(
  ClimbingTestLayer,
  PresenterLayer
)

export const ClimbingAdapterTestRuntime =
  ManagedRuntime.make(AdapterTestLayer)
