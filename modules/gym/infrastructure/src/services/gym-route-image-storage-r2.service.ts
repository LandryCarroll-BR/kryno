import crypto from "node:crypto"
import { Config, Effect, Layer } from "effect"
import * as Redacted from "effect/Redacted"
import { R2, S3ObjectClient, type S3ObjectClientFactory } from "@packages/effect-s3"
import {
  type GymRouteImageContentType,
  GymRouteImageUrl,
} from "@gym/application/models/gym-route"
import { GymRouteImageStorage } from "@gym/application/services/gym-route-image-storage"

const extensionByContentType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} satisfies Record<GymRouteImageContentType, string>

type R2StorageConfig = {
  readonly accountId: string
  readonly accessKeyId: Redacted.Redacted<string>
  readonly secretAccessKey: Redacted.Redacted<string>
  readonly bucket: string
  readonly publicUrlBase: string
  readonly keyPrefix: string
}

type GymRouteImageStorageR2Options = {
  readonly createClient?: S3ObjectClientFactory
  readonly randomBytes?: (size: number) => Uint8Array
}

const config = Effect.gen(function* () {
  return {
    accountId: yield* Config.string("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: yield* Config.redacted("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: yield* Config.redacted(
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    ),
    bucket: yield* Config.string("GYM_ROUTE_IMAGE_R2_BUCKET"),
    publicUrlBase: yield* Config.string(
      "GYM_ROUTE_IMAGE_PUBLIC_URL_BASE"
    ),
    keyPrefix: yield* Config.string("GYM_ROUTE_IMAGE_R2_KEY_PREFIX").pipe(
      Config.withDefault("gym-route-images")
    ),
  } satisfies R2StorageConfig
})

const extensionFor = (contentType: GymRouteImageContentType) =>
  extensionByContentType[contentType]

const normalizePublicUrlBase = (publicUrlBase: string) =>
  publicUrlBase.replace(/\/+$/, "")

const normalizeKeyPrefix = (keyPrefix: string) =>
  keyPrefix.replace(/^\/+|\/+$/g, "")

const keyFor = ({
  routeId,
  contentType,
  keyPrefix,
  randomBytes,
}: {
  readonly routeId: string
  readonly contentType: GymRouteImageContentType
  readonly keyPrefix: string
  readonly randomBytes: (size: number) => Uint8Array
}) => {
  const filename = `${routeId}-${Buffer.from(randomBytes(8)).toString(
    "hex"
  )}.${extensionFor(contentType)}`
  const prefix = normalizeKeyPrefix(keyPrefix)

  return prefix.length === 0 ? filename : `${prefix}/${filename}`
}

const keyFromPublicUrl = ({
  imageUrl,
  publicUrlBase,
}: {
  readonly imageUrl: GymRouteImageUrl
  readonly publicUrlBase: string
}) => {
  const normalizedPublicUrlBase = normalizePublicUrlBase(publicUrlBase)
  const imageUrlString = String(imageUrl)
  const publicUrlPrefix = `${normalizedPublicUrlBase}/`

  return imageUrlString.startsWith(publicUrlPrefix)
    ? imageUrlString.slice(publicUrlPrefix.length)
    : undefined
}

export const makeGymRouteImageStorageR2 = ({
  createClient = S3ObjectClient.make,
  randomBytes = crypto.randomBytes,
}: GymRouteImageStorageR2Options = {}) =>
  Layer.effect(
    GymRouteImageStorage,
    Effect.gen(function* () {
      const storageConfig = yield* config
      const client = createClient({
        region: "auto",
        endpoint: R2.endpointForAccountId(storageConfig.accountId),
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.secretAccessKey,
      })

      return {
        store: Effect.fn("GymRouteImageStorage.store")(function* ({
          routeId,
          image,
        }) {
          const key = keyFor({
            routeId,
            contentType: image.contentType,
            keyPrefix: storageConfig.keyPrefix,
            randomBytes,
          })

          yield* client
            .putObject({
              bucket: storageConfig.bucket,
              key,
              body: image.bytes,
              contentType: image.contentType,
              contentLength: image.bytes.byteLength,
            })
            .pipe(Effect.orDie)

          return GymRouteImageUrl.make(
            `${normalizePublicUrlBase(storageConfig.publicUrlBase)}/${key}`
          )
        }),
        delete: Effect.fn("GymRouteImageStorage.delete")(
          function* (imageUrl) {
            const key = keyFromPublicUrl({
              imageUrl,
              publicUrlBase: storageConfig.publicUrlBase,
            })

            if (key === undefined || key.length === 0) {
              return
            }

            yield* client
              .deleteObject({
                bucket: storageConfig.bucket,
                key,
              })
              .pipe(Effect.orDie)
          }
        ),
      }
    })
  )

export const GymRouteImageStorageR2 = makeGymRouteImageStorageR2()
