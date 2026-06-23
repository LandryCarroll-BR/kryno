import { Layer, ManagedRuntime } from "effect"
import { AuthLayer } from "@auth/component"

import { SignUpPresenter } from "./presenters/sign-up.presenter"
import { SignInPresenter } from "./presenters/sign-in.presenter"

export * from "./controllers/sign-in.controller"
export * from "./controllers/sign-up.controller"
export * from "./controllers/sign-out.controller"
export * from "./controllers/get-current-user.controller"

export * from "./presenters/sign-in.presenter"
export * from "./presenters/sign-up.presenter"

export const PresenterLayer = Layer.mergeAll(
  SignUpPresenter.Live,
  SignInPresenter.Live
)

export const AdapterLayer = Layer.mergeAll(AuthLayer, PresenterLayer)

export const AuthAdapterRuntime = ManagedRuntime.make(AdapterLayer)
