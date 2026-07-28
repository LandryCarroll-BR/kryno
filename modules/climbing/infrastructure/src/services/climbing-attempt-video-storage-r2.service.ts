import crypto from "node:crypto"
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3"
import { Config, Effect, Layer } from "effect"
import * as Redacted from "effect/Redacted"
import {
  type ClimbingAttemptVideoContentType,
  ClimbingAttemptVideoUrl,
} from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptVideoStorage } from "@climbing/application/services/climbing-attempt-video-storage"

const extensionByContentType = {
  "video/mp4": "mp4",
  "video/webm": "webm",
} satisfies Record<ClimbingAttemptVideoContentType, string>

type R2StorageConfig = {
  readonly accountId: string
  readonly accessKeyId: Redacted.Redacted<string>
  readonly secretAccessKey: Redacted.Redacted<string>
  readonly bucket: string
  readonly publicUrlBase: string
  readonly keyPrefix: string
}

type R2StorageClient = {
  readonly send: (
    command: PutObjectCommand | DeleteObjectCommand
  ) => Promise<unknown>
}

type R2StorageClientFactory = (config: S3ClientConfig) => R2StorageClient

type ClimbingAttemptVideoStorageR2Options = {
  readonly createClient?: R2StorageClientFactory
  readonly randomBytes?: (size: number) => Uint8Array
}

const config = Effect.gen(function* () {
  return {
    accountId: yield* Config.string("CLOUDFLARE_R2_ACCOUNT_ID"),
    accessKeyId: yield* Config.redacted("CLOUDFLARE_R2_ACCESS_KEY_ID"),
    secretAccessKey: yield* Config.redacted(
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY"
    ),
    bucket: yield* Config.string("CLIMBING_ATTEMPT_VIDEO_R2_BUCKET"),
    publicUrlBase: yield* Config.string(
      "CLIMBING_ATTEMPT_VIDEO_PUBLIC_URL_BASE"
    ),
    keyPrefix: yield* Config.string(
      "CLIMBING_ATTEMPT_VIDEO_R2_KEY_PREFIX"
    ).pipe(Config.withDefault("climbing-attempt-videos")),
  } satisfies R2StorageConfig
})

const createS3Client: R2StorageClientFactory = (config) => {
  const client = new S3Client(config)

  return {
    send: (command) => {
      if (command instanceof PutObjectCommand) {
        return client.send(command)
      }

      return client.send(command)
    },
  }
}

const extensionFor = (contentType: ClimbingAttemptVideoContentType) =>
  extensionByContentType[contentType]

const endpointFor = (accountId: string) =>
  `https://${accountId}.r2.cloudflarestorage.com`

const normalizePublicUrlBase = (publicUrlBase: string) =>
  publicUrlBase.replace(/\/+$/, "")

const normalizeKeyPrefix = (keyPrefix: string) =>
  keyPrefix.replace(/^\/+|\/+$/g, "")

const keyFor = ({
  attemptId,
  contentType,
  keyPrefix,
  randomBytes,
}: {
  readonly attemptId: string
  readonly contentType: ClimbingAttemptVideoContentType
  readonly keyPrefix: string
  readonly randomBytes: (size: number) => Uint8Array
}) => {
  const filename = `${attemptId}-${Buffer.from(randomBytes(8)).toString(
    "hex"
  )}.${extensionFor(contentType)}`
  const prefix = normalizeKeyPrefix(keyPrefix)

  return prefix.length === 0 ? filename : `${prefix}/${filename}`
}

const keyFromPublicUrl = ({
  publicUrlBase,
  videoUrl,
}: {
  readonly publicUrlBase: string
  readonly videoUrl: ClimbingAttemptVideoUrl
}) => {
  const normalizedPublicUrlBase = normalizePublicUrlBase(publicUrlBase)
  const videoUrlString = String(videoUrl)
  const publicUrlPrefix = `${normalizedPublicUrlBase}/`

  return videoUrlString.startsWith(publicUrlPrefix)
    ? videoUrlString.slice(publicUrlPrefix.length)
    : undefined
}

export const makeClimbingAttemptVideoStorageR2 = ({
  createClient = createS3Client,
  randomBytes = crypto.randomBytes,
}: ClimbingAttemptVideoStorageR2Options = {}) =>
  Layer.effect(
    ClimbingAttemptVideoStorage,
    Effect.gen(function* () {
      const storageConfig = yield* config
      const client = createClient({
        region: "auto",
        endpoint: endpointFor(storageConfig.accountId),
        credentials: {
          accessKeyId: Redacted.value(storageConfig.accessKeyId),
          secretAccessKey: Redacted.value(storageConfig.secretAccessKey),
        },
      })

      return {
        store: Effect.fn("ClimbingAttemptVideoStorage.store")(function* ({
          attemptId,
          video,
        }) {
          const key = keyFor({
            attemptId,
            contentType: video.contentType,
            keyPrefix: storageConfig.keyPrefix,
            randomBytes,
          })

          yield* Effect.tryPromise(() =>
            client.send(
              new PutObjectCommand({
                Bucket: storageConfig.bucket,
                Key: key,
                Body: video.bytes,
                ContentType: video.contentType,
                ContentLength: video.bytes.byteLength,
              })
            )
          ).pipe(Effect.orDie)

          return ClimbingAttemptVideoUrl.make(
            `${normalizePublicUrlBase(storageConfig.publicUrlBase)}/${key}`
          )
        }),
        delete: Effect.fn("ClimbingAttemptVideoStorage.delete")(
          function* (videoUrl) {
            const key = keyFromPublicUrl({
              publicUrlBase: storageConfig.publicUrlBase,
              videoUrl,
            })

            if (key === undefined || key.length === 0) {
              return
            }

            yield* Effect.tryPromise(() =>
              client.send(
                new DeleteObjectCommand({
                  Bucket: storageConfig.bucket,
                  Key: key,
                })
              )
            ).pipe(Effect.orDie)
          }
        ),
      }
    })
  )

export const ClimbingAttemptVideoStorageR2 =
  makeClimbingAttemptVideoStorageR2()
