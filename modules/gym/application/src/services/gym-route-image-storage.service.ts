import type { Effect } from "effect"
import { Service } from "effect/Context"

import type {
  GymRouteId,
  GymRouteImageUpload,
  GymRouteImageUrl,
} from "../models/gym-route.models"

export class GymRouteImageStorage extends Service<
  GymRouteImageStorage,
  {
    readonly store: (input: {
      readonly routeId: GymRouteId
      readonly image: GymRouteImageUpload
    }) => Effect.Effect<GymRouteImageUrl>
    readonly delete: (
      imageUrl: GymRouteImageUrl
    ) => Effect.Effect<void>
  }
>()("@gym/application/GymRouteImageStorage") {}
