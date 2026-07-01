import { Layer, ManagedRuntime } from "effect"
import { GymLayer } from "@gym/component"

import { CreateGymPresenter } from "./presenters/create-gym.presenter"
import { JoinGymPresenter } from "./presenters/join-gym.presenter"
import { ListGymsPresenter } from "./presenters/list-gyms.presenter"

export const PresenterLayer = Layer.mergeAll(
  CreateGymPresenter.Live,
  JoinGymPresenter.Live,
  ListGymsPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(GymLayer, PresenterLayer)

export const GymAdapterRuntime = ManagedRuntime.make(AdapterLayer)
