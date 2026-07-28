import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import {
  GymRouteId,
  GymRouteImageBytes,
  GymRouteImageUrl,
} from "@gym/application/models/gym-route"
import { GymRouteImageStorage } from "@gym/application/services/gym-route-image-storage"
import type {
  DeleteObjectInput,
  PutObjectInput,
  S3ClientConfig,
} from "@packages/effect-s3"

import { makeGymRouteImageStorageR2 } from "../src/services/gym-route-image-storage-r2.service"

const configLayer = ConfigProvider.layer(
  ConfigProvider.fromUnknown({
    CLOUDFLARE_R2_ACCOUNT_ID: "account-123",
    CLOUDFLARE_R2_ACCESS_KEY_ID: "access-key",
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: "secret-key",
    GYM_ROUTE_IMAGE_R2_BUCKET: "route-images",
    GYM_ROUTE_IMAGE_PUBLIC_URL_BASE: "https://images.example.com/",
    GYM_ROUTE_IMAGE_R2_KEY_PREFIX: "/gym-routes/",
  })
)

describe("GymRouteImageStorageR2", () => {
  it.effect("stores route images in R2 and returns a public URL", () => {
    const clientConfigs: S3ClientConfig[] = []
    const putObjects: PutObjectInput[] = []
    const imageBytes = GymRouteImageBytes.make(new Uint8Array([1, 2, 3]))
    const storageLayer = makeGymRouteImageStorageR2({
      createClient: (config) => {
        clientConfigs.push(config)

        return {
          putObject: (input) =>
            Effect.sync(() => {
              putObjects.push(input)
            }),
          deleteObject: () => Effect.void,
        }
      },
      randomBytes: () => new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
    }).pipe(Layer.provide(configLayer))

    return Effect.gen(function* () {
      const storage = yield* GymRouteImageStorage
      const url = yield* storage.store({
        routeId: GymRouteId.make("route-1"),
        image: {
          bytes: imageBytes,
          contentType: "image/png",
          fileName: "ignored.png",
        },
      })

      expect(String(url)).toBe(
        "https://images.example.com/gym-routes/route-1-0001020304050607.png"
      )
      expect(clientConfigs).toHaveLength(1)
      expect(clientConfigs[0]).toMatchObject({
        region: "auto",
        endpoint: "https://account-123.r2.cloudflarestorage.com",
      })
      expect(putObjects).toEqual([
        {
          bucket: "route-images",
          key: "gym-routes/route-1-0001020304050607.png",
          body: imageBytes,
          contentType: "image/png",
          contentLength: 3,
        },
      ])
    }).pipe(Effect.provide(storageLayer))
  })

  it.effect("deletes R2 objects only for configured public URLs", () => {
    const deleteObjects: DeleteObjectInput[] = []
    const storageLayer = makeGymRouteImageStorageR2({
      createClient: () => ({
        putObject: () => Effect.void,
        deleteObject: (input) =>
          Effect.sync(() => {
            deleteObjects.push(input)
          }),
      }),
    }).pipe(Layer.provide(configLayer))

    return Effect.gen(function* () {
      const storage = yield* GymRouteImageStorage

      yield* storage.delete(
        GymRouteImageUrl.make(
          "https://images.example.com/gym-routes/route-1.png"
        )
      )
      yield* storage.delete(
        GymRouteImageUrl.make(
          "https://elsewhere.example.com/gym-routes/route-2.png"
        )
      )

      expect(deleteObjects).toEqual([
        {
          bucket: "route-images",
          key: "gym-routes/route-1.png",
        },
      ])
    }).pipe(Effect.provide(storageLayer))
  })
})
