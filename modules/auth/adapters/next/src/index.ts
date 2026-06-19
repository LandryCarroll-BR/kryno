import { Layer, ManagedRuntime } from "effect"
import { AuthLayer } from "@auth/component"

import { SignUpPresenter } from "./presenters/sign-up.presenter"
import { SignInPresenter } from "./presenters/sign-in.presenter"

export * from "./controllers/sign-in.controller"
export * from "./controllers/sign-up.controller"

export * from "./presenters/sign-in.presenter"
export * from "./presenters/sign-up.presenter"

export const AppLayer = Layer.mergeAll(
  AuthLayer,
  SignUpPresenter.Live,
  SignInPresenter.Live
)

export const AuthRuntime = ManagedRuntime.make(AppLayer)
