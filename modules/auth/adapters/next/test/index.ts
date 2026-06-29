import { Layer, ManagedRuntime } from "effect"
import { AuthTestLayer } from "@auth/component/test"

import { PresenterLayer } from "../src/index"

export const AdapterTestLayer = Layer.mergeAll(AuthTestLayer, PresenterLayer)

export const AuthAdapterTestRuntime = ManagedRuntime.make(AdapterTestLayer)
