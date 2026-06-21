import { Layer, ManagedRuntime } from "effect"
import { AuthTestLayer } from "@auth/component/test"

import { PresenterLayer } from "../src/index"

export * from "../src/controllers/sign-in.controller"
export * from "../src/controllers/sign-up.controller"
export * from "../src/controllers/sign-out.controller"
export * from "../src/controllers/get-current-user.controller"

export * from "../src/presenters/sign-in.presenter"
export * from "../src/presenters/sign-up.presenter"

export const AdapterTestLayer = Layer.mergeAll(AuthTestLayer, PresenterLayer)

export const AuthAdapterTestRuntime = ManagedRuntime.make(AdapterTestLayer)
