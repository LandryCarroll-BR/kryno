import { Effect, Layer } from "effect"
import { Service } from "effect/Context"
import type { Boulder } from "@climbing/application"

export type CreatedBoulderViewModel = {
  readonly id: string
  readonly name: string
  readonly grade: string
  readonly wallAngle: string
  readonly movementStyle: string
  readonly createdAt: string
  readonly updatedAt: string
}

export type ListCreatedBouldersViewModel = {
  readonly status: "ready"
  readonly boulders: readonly CreatedBoulderViewModel[]
}

export class ListCreatedBouldersPresenter extends Service<
  ListCreatedBouldersPresenter,
  {
    readonly present: (
      boulders: readonly Boulder[]
    ) => Effect.Effect<ListCreatedBouldersViewModel>
  }
>()("@climbing/adapters/next/ListCreatedBouldersPresenter") {
  static Live = Layer.succeed(ListCreatedBouldersPresenter, {
    present: (boulders) =>
      Effect.succeed({
        status: "ready",
        boulders: boulders.map((boulder) => ({
          id: boulder.id,
          name: boulder.name,
          grade: boulder.grade,
          wallAngle: boulder.wallAngle,
          movementStyle: boulder.movementStyle,
          createdAt: boulder.createdAt.toISOString(),
          updatedAt: boulder.updatedAt.toISOString(),
        })),
      }),
  })
}
