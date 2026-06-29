import { Layer, ManagedRuntime } from "effect"
import { AuthLayer } from "@auth/component"

import { SignUpPresenter } from "./presenters/sign-up.presenter"
import { SignInPresenter } from "./presenters/sign-in.presenter"

export const PresenterLayer = Layer.mergeAll(
  SignUpPresenter.Live,
  SignInPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(AuthLayer, PresenterLayer)

export const AuthAdapterRuntime = ManagedRuntime.make(AdapterLayer)
