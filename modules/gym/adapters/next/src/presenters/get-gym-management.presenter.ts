import { Effect, Layer, Option } from "effect"
import { Service } from "effect/Context"
import type { GetGymManagementOutput } from "@gym/application/use-cases/get-gym-management"
import type { SchemaError } from "effect/Schema"

import {
  getGymManagementInitialViewModel,
  type GetGymManagementViewModel,
} from "../view-models/get-gym-management.view-model"

export class GetGymManagementPresenter extends Service<
  GetGymManagementPresenter,
  {
    readonly presentSuccess: (
      success: GetGymManagementOutput
    ) => Effect.Effect<GetGymManagementViewModel>
    readonly presentSchemaError: (
      error: SchemaError
    ) => Effect.Effect<GetGymManagementViewModel>
    readonly presentUnexpectedError: () => Effect.Effect<GetGymManagementViewModel>
  }
>()("@gym/adapters/next/GetGymManagementPresenter") {
  static Live = Layer.succeed(GetGymManagementPresenter, {
    presentSuccess: ({ gym, areas, assignableBoulders }) => {
      const boulders = assignableBoulders.map((boulder) => ({
        value: boulder.id,
        label: `${boulder.name} (${boulder.grade})`,
      }))
      const labelsById = new Map(
        boulders.map(({ label, value }) => [value, label])
      )

      return Effect.succeed({
        ...getGymManagementInitialViewModel,
        status: "success",
        message:
          areas.length === 0
            ? "Create the first area for this gym."
            : "",
        fields: {
          gym: {
            ...getGymManagementInitialViewModel.fields.gym,
            value: { id: gym.id, name: gym.name },
          },
          areas: {
            ...getGymManagementInitialViewModel.fields.areas,
            value: areas.map(({ area, routes }) => ({
              id: area.id,
              name: area.name,
              routes: routes.map((route) => ({
                id: route.id,
                order: route.order,
                positionLabel: Option.getOrNull(route.positionLabel),
                setOn: route.setOn,
                setterName: Option.getOrNull(route.setterName),
                boulder: Option.match(route.boulderId, {
                  onNone: () => null,
                  onSome: (id) => {
                    const label = labelsById.get(id)
                    return {
                      id,
                      label: label ?? `Unavailable boulder (${id})`,
                      available: label !== undefined,
                    }
                  },
                }),
              })),
            })),
          },
          boulders: {
            ...getGymManagementInitialViewModel.fields.boulders,
            value: boulders,
          },
        },
      })
    },
    presentSchemaError: (_error) =>
      Effect.succeed({
        ...getGymManagementInitialViewModel,
        status: "invalid",
        message: "Unable to identify this gym.",
      }),
    presentUnexpectedError: () =>
      Effect.succeed({
        ...getGymManagementInitialViewModel,
        status: "error",
        message: "Unable to load gym management. Please try again.",
      }),
  })
}
