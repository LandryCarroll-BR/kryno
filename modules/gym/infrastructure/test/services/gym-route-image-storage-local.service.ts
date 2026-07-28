import crypto from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
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

const storageRoot = () =>
  process.env.GYM_ROUTE_IMAGE_STORAGE_ROOT ??
  path.join(process.cwd(), "public", "uploads", "gym-routes")

const urlPrefix = () =>
  (
    process.env.GYM_ROUTE_IMAGE_URL_PREFIX ?? "/uploads/gym-routes"
  ).replace(/\/$/, "")

const filenameFor = ({
  routeId,
  contentType,
}: {
  readonly routeId: string
  readonly contentType: GymRouteImageContentType
}) =>
  `${routeId}-${crypto.randomBytes(8).toString("hex")}.${extensionFor(
    contentType
  )}`

export const GymRouteImageStorageLocal = Layer.succeed(
  GymRouteImageStorage,
  {
    store: Effect.fn("GymRouteImageStorage.store")(function* ({
      routeId,
      image,
    }) {
      const root = storageRoot()
      const prefix = urlPrefix()
      const filename = filenameFor({
        routeId,
        contentType: image.contentType,
      })

      yield* Effect.tryPromise(() => mkdir(root, { recursive: true })).pipe(
        Effect.orDie
      )
      yield* Effect.tryPromise(() =>
        writeFile(path.join(root, filename), image.bytes)
      ).pipe(Effect.orDie)

      return GymRouteImageUrl.make(`${prefix}/${filename}`)
    }),
    delete: Effect.fn("GymRouteImageStorage.delete")(function* (imageUrl) {
      const prefix = urlPrefix()
      const imageUrlString = String(imageUrl)
      if (!imageUrlString.startsWith(`${prefix}/`)) {
        return
      }

      const filename = imageUrlString.slice(prefix.length + 1)
      if (filename !== path.basename(filename)) {
        return
      }

      yield* Effect.tryPromise(() =>
        rm(path.join(storageRoot(), filename), { force: true })
      ).pipe(Effect.orDie)
    }),
  }
)
