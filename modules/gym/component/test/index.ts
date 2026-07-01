import { Layer } from "effect"
import { ApplicationLayer } from "@gym/application"
import { InfrastructureTestLayer } from "@gym/infrastructure/test"

import { Gym } from "../src/index"

const ComponentTestLayer = Layer.provideMerge(
  ApplicationLayer,
  InfrastructureTestLayer
)

export const GymTestLayer = Gym.Live.pipe(
  Layer.provide(ComponentTestLayer)
)
