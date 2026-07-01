import { Layer } from "effect"
import { Service } from "effect/Context"
import { ApplicationLayer } from "@gym/application"
import { InfrastructureLayer } from "@gym/infrastructure"

export class Gym extends Service<
  Gym,
  Record<never, never>
>()("@gym/component/Gym") {
  static Live = Layer.succeed(Gym, {})
}

const ComponentLayer = Layer.provideMerge(ApplicationLayer, InfrastructureLayer)

export const GymLayer = Gym.Live.pipe(Layer.provide(ComponentLayer))
