import { Layer, ManagedRuntime } from "effect"
import { GymLayer } from "@gym/component"

import { CreateGymPresenter } from "./presenters/create-gym.presenter"

export const PresenterLayer = Layer.mergeAll(CreateGymPresenter.Live)

export const AdapterLayer = Layer.mergeAll(GymLayer, PresenterLayer)

export const GymAdapterRuntime = ManagedRuntime.make(AdapterLayer)
