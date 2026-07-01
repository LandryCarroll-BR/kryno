import type { Effect } from "effect"
import { Service } from "effect/Context"
import type {
  BoulderGrade,
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"

export type AssignableGymBoulder = {
  readonly id: BoulderId
  readonly name: BoulderName
  readonly grade: BoulderGrade
}

export class GymBoulderCatalog extends Service<
  GymBoulderCatalog,
  {
    readonly listOwned: (
      token: string
    ) => Effect.Effect<readonly AssignableGymBoulder[]>
  }
>()("@gym/application/GymBoulderCatalog") {}
