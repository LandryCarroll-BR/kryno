import type { Effect } from "effect"
import { Service } from "effect/Context"
import type {
  BoulderGrade,
  BoulderId,
  BoulderName,
  MovementStyle,
  WallAngle,
} from "@climbing/application/models/boulder"

import type { UnauthenticatedGymAdministratorError } from "../errors/gym.errors"

export type AssignableGymBoulder = {
  readonly id: BoulderId
  readonly name: BoulderName
  readonly grade: BoulderGrade
  readonly wallAngle: WallAngle
  readonly movementStyle: MovementStyle
}

export type CreateOwnedGymBoulderInput = {
  readonly token: string
  readonly name: BoulderName
  readonly grade: BoulderGrade
  readonly wallAngle: WallAngle
  readonly movementStyle: MovementStyle
}

export class GymBoulderCatalog extends Service<
  GymBoulderCatalog,
  {
    readonly createOwned: (
      input: CreateOwnedGymBoulderInput
    ) => Effect.Effect<
      AssignableGymBoulder,
      UnauthenticatedGymAdministratorError
    >
    readonly deleteOwned: (input: {
      readonly token: string
      readonly boulderId: BoulderId
    }) => Effect.Effect<void>
    readonly listOwned: (
      token: string
    ) => Effect.Effect<readonly AssignableGymBoulder[]>
    readonly getByIds: (
      boulderIds: readonly BoulderId[]
    ) => Effect.Effect<readonly AssignableGymBoulder[]>
  }
>()("@gym/application/GymBoulderCatalog") {}
