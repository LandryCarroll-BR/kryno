import { Layer, ManagedRuntime } from "effect"
import { GymTestLayer } from "@gym/component/test"

import { PresenterLayer } from "../src/index"

export const AdapterTestLayer = Layer.mergeAll(
  GymTestLayer,
  PresenterLayer
)

export const GymAdapterTestRuntime = ManagedRuntime.make(AdapterTestLayer)
