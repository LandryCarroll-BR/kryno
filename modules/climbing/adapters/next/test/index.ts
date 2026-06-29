export {}
import { Layer, ManagedRuntime } from "effect"
import { ClimbingTestLayer } from "@climbing/component/test"

import { PresenterLayer } from "../src/index"

export const AdapterTestLayer = Layer.mergeAll(
  ClimbingTestLayer,
  PresenterLayer
)

export const ClimbingAdapterTestRuntime = ManagedRuntime.make(AdapterTestLayer)
