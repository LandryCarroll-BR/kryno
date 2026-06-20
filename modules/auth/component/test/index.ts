import { Layer } from "effect"
import { InfrastructureTextLayer } from "@auth/infrastructure/test"
import { ApplicationLayer } from "@auth/application"

import { Auth } from "../src/index"

const ComponentTestLayer = Layer.provideMerge(
  ApplicationLayer,
  InfrastructureTextLayer
)

export const AuthTestLayer = Auth.Live.pipe(Layer.provide(ComponentTestLayer))
