import { Layer, ManagedRuntime } from "effect"
import { SignUpPresenter } from "./presenters/sign-up.presenter"
import { AuthLayer } from "@auth/component"

export * from "./controllers/sign-up.controller"
export * from "./presenters/sign-up.presenter"

export const AppLayer = Layer.merge(AuthLayer, SignUpPresenter.Live)

export const AuthRuntime = ManagedRuntime.make(AppLayer)
