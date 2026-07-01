import { Layer, ManagedRuntime } from "effect"
import { GymLayer } from "@gym/component"

export const PresenterLayer = Layer.empty

export const AdapterLayer = Layer.mergeAll(GymLayer, PresenterLayer)

export const GymAdapterRuntime = ManagedRuntime.make(AdapterLayer)
