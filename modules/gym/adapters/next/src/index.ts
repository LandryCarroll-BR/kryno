import { Layer, ManagedRuntime } from "effect"
import { GymLayer } from "@gym/component"

import { CreateGymPresenter } from "./presenters/create-gym.presenter"
import { CreateGymAreaPresenter } from "./presenters/create-gym-area.presenter"
import { CreateGymRoutePresenter } from "./presenters/create-gym-route.presenter"
import { GetGymManagementPresenter } from "./presenters/get-gym-management.presenter"
import { JoinGymPresenter } from "./presenters/join-gym.presenter"
import { ListGymsPresenter } from "./presenters/list-gyms.presenter"

export const PresenterLayer = Layer.mergeAll(
  CreateGymPresenter.Live,
  CreateGymAreaPresenter.Live,
  CreateGymRoutePresenter.Live,
  GetGymManagementPresenter.Live,
  JoinGymPresenter.Live,
  ListGymsPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(GymLayer, PresenterLayer)

export const GymAdapterRuntime = ManagedRuntime.make(AdapterLayer)
