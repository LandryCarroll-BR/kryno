import { Layer, ManagedRuntime } from "effect"
import { AuthLayer } from "@auth/component"

import { GetCurrentUserPresenter } from "./presenters/get-current-user.presenter"
import { SignInPresenter } from "./presenters/sign-in.presenter"
import { SignOutPresenter } from "./presenters/sign-out.presenter"
import { SignUpPresenter } from "./presenters/sign-up.presenter"

export const PresenterLayer = Layer.mergeAll(
  GetCurrentUserPresenter.Live,
  SignInPresenter.Live,
  SignOutPresenter.Live,
  SignUpPresenter.Live,
)

export const AdapterLayer = Layer.mergeAll(AuthLayer, PresenterLayer)

export const AuthAdapterRuntime = ManagedRuntime.make(AdapterLayer)
