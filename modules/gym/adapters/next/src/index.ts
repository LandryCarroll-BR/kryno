import { Layer, ManagedRuntime } from "effect"
import { GymLayer } from "@gym/component"

import { CreateGymPresenter } from "./presenters/create-gym.presenter"
import { CreateGymAreaPresenter } from "./presenters/create-gym-area.presenter"
import { CreateGymRoutePresenter } from "./presenters/create-gym-route.presenter"
import { DeleteGymRoutePresenter } from "./presenters/delete-gym-route.presenter"
import { EditGymRoutePresenter } from "./presenters/edit-gym-route.presenter"
import { GetGymManagementPresenter } from "./presenters/get-gym-management.presenter"
import { GetGymRoutesPresenter } from "./presenters/get-gym-routes.presenter"
import { JoinGymPresenter } from "./presenters/join-gym.presenter"
import { ListGymRouteAttemptHistoryPresenter } from "./presenters/list-gym-route-attempt-history.presenter"
import { ListGymsPresenter } from "./presenters/list-gyms.presenter"
import { LogGymRouteAttemptPresenter } from "./presenters/log-gym-route-attempt.presenter"

export const PresenterLayer = Layer.mergeAll(
  CreateGymPresenter.Live,
  CreateGymAreaPresenter.Live,
  CreateGymRoutePresenter.Live,
  DeleteGymRoutePresenter.Live,
  EditGymRoutePresenter.Live,
  GetGymManagementPresenter.Live,
  GetGymRoutesPresenter.Live,
  JoinGymPresenter.Live,
  ListGymRouteAttemptHistoryPresenter.Live,
  ListGymsPresenter.Live,
  LogGymRouteAttemptPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(GymLayer, PresenterLayer)

export const GymAdapterRuntime = ManagedRuntime.make(AdapterLayer)
