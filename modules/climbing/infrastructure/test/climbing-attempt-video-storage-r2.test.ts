import {
  DeleteObjectCommand,
  PutObjectCommand,
  type S3ClientConfig,
} from "@aws-sdk/client-s3"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import {
  ClimbingAttemptId,
  ClimbingAttemptVideoBytes,
  ClimbingAttemptVideoUrl,
} from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptVideoStorage } from "@climbing/application/services/climbing-attempt-video-storage"

import { makeClimbingAttemptVideoStorageR2 } from "../src/services/climbing-attempt-video-storage-r2.service"

const configLayer = ConfigProvider.layer(
  ConfigProvider.fromUnknown({
    CLOUDFLARE_R2_ACCOUNT_ID: "account-123",
    CLOUDFLARE_R2_ACCESS_KEY_ID: "access-key",
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: "secret-key",
    CLIMBING_ATTEMPT_VIDEO_R2_BUCKET: "attempt-videos",
    CLIMBING_ATTEMPT_VIDEO_PUBLIC_URL_BASE: "https://videos.example.com/",
    CLIMBING_ATTEMPT_VIDEO_R2_KEY_PREFIX: "/attempts/",
  })
)

describe("ClimbingAttemptVideoStorageR2", () => {
  it.effect("stores attempt videos in R2 and returns a public URL", () => {
    const clientConfigs: S3ClientConfig[] = []
    const commands: Array<PutObjectCommand | DeleteObjectCommand> = []
    const videoBytes = ClimbingAttemptVideoBytes.make(
      new Uint8Array([1, 2, 3])
    )
    const storageLayer = makeClimbingAttemptVideoStorageR2({
      createClient: (config) => {
        clientConfigs.push(config)

        return {
          send: (command) => {
            commands.push(command)
            return Promise.resolve({})
          },
        }
      },
      randomBytes: () => new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
    }).pipe(Layer.provide(configLayer))

    return Effect.gen(function* () {
      const storage = yield* ClimbingAttemptVideoStorage
      const url = yield* storage.store({
        attemptId: ClimbingAttemptId.make("attempt-1"),
        video: {
          bytes: videoBytes,
          contentType: "video/mp4",
          fileName: "ignored.mp4",
        },
      })

      expect(String(url)).toBe(
        "https://videos.example.com/attempts/attempt-1-0001020304050607.mp4"
      )
      expect(clientConfigs).toHaveLength(1)
      expect(clientConfigs[0]).toMatchObject({
        region: "auto",
        endpoint: "https://account-123.r2.cloudflarestorage.com",
        credentials: {
          accessKeyId: "access-key",
          secretAccessKey: "secret-key",
        },
      })
      expect(commands).toHaveLength(1)
      expect(commands[0]).toBeInstanceOf(PutObjectCommand)
      expect(commands[0]?.input).toMatchObject({
        Bucket: "attempt-videos",
        Key: "attempts/attempt-1-0001020304050607.mp4",
        Body: videoBytes,
        ContentType: "video/mp4",
        ContentLength: 3,
      })
    }).pipe(Effect.provide(storageLayer))
  })

  it.effect("deletes R2 objects only for configured public URLs", () => {
    const commands: Array<PutObjectCommand | DeleteObjectCommand> = []
    const storageLayer = makeClimbingAttemptVideoStorageR2({
      createClient: () => ({
        send: (command) => {
          commands.push(command)
          return Promise.resolve({})
        },
      }),
    }).pipe(Layer.provide(configLayer))

    return Effect.gen(function* () {
      const storage = yield* ClimbingAttemptVideoStorage

      yield* storage.delete(
        ClimbingAttemptVideoUrl.make(
          "https://videos.example.com/attempts/attempt-1.mp4"
        )
      )
      yield* storage.delete(
        ClimbingAttemptVideoUrl.make(
          "https://elsewhere.example.com/attempts/attempt-2.mp4"
        )
      )

      expect(commands).toHaveLength(1)
      expect(commands[0]).toBeInstanceOf(DeleteObjectCommand)
      expect(commands[0]?.input).toMatchObject({
        Bucket: "attempt-videos",
        Key: "attempts/attempt-1.mp4",
      })
    }).pipe(Effect.provide(storageLayer))
  })
})
