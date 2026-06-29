import { Layer } from "effect"
import { ApplicationLayer } from "@climbing/application"
import { InfrastructureTestLayer } from "@climbing/infrastructure/test"

import { Climbing } from "../src/index"

const ComponentTestLayer = Layer.provideMerge(
  ApplicationLayer,
  InfrastructureTestLayer
)

export const ClimbingTestLayer = Climbing.Live.pipe(
  Layer.provide(ComponentTestLayer)
)
