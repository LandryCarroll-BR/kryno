import { Effect, Layer } from "effect"
import {
  GymRouteImageContentType,
  GymRouteImageUrl,
} from "@gym/application/models/gym-route"
import { GymRouteImageStorage } from "@gym/application/services/gym-route-image-storage"

const extensionByContentType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} satisfies Record<GymRouteImageContentType, string>

const extensionFor = (contentType: GymRouteImageContentType) =>
  extensionByContentType[contentType]

export const GymRouteImageStorageTest = Layer.succeed(
  GymRouteImageStorage,
  {
    store: Effect.fn("GymRouteImageStorage.store")(function* ({
      routeId,
      image,
    }) {
      return GymRouteImageUrl.make(
        `/uploads/gym-routes/${routeId}.${extensionFor(
          image.contentType
        )}`
      )
    }),
    delete: Effect.fn("GymRouteImageStorage.delete")(function* () {
      return undefined
    }),
  }
)
