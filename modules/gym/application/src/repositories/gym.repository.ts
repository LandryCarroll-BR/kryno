import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { Gym } from "../models/gym.models"

export class GymRepository extends Service<
  GymRepository,
  {
    readonly insert: (gym: Gym) => Effect.Effect<Gym>
  }
>()("@gym/application/GymRepository") {}
