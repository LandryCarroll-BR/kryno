import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type { Gym, GymId } from "../models/gym.models"

export class GymRepository extends Service<
  GymRepository,
  {
    readonly findAll: () => Effect.Effect<readonly Gym[]>
    readonly findById: (gymId: GymId) => Effect.Effect<Option.Option<Gym>>
    readonly insert: (gym: Gym) => Effect.Effect<Gym>
  }
>()("@gym/application/GymRepository") {}
