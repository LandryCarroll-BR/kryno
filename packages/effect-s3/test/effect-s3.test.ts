import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as Redacted from "effect/Redacted"

import { R2, S3ObjectClient } from "../src/index"

describe("S3ObjectClient", () => {
  it.effect("maps putObject input to PutObjectCommand", () => {
    const clientConfigs: unknown[] = []
    const commands: unknown[] = []
    const body = new Uint8Array([1, 2, 3])
    const client = S3ObjectClient.makeWithSdkClientFactory((config) => {
      clientConfigs.push(config)

      return {
        send: (command) => {
          commands.push(command)
          return Promise.resolve({})
        },
      }
    })({
      region: "auto",
      endpoint: "https://account-123.r2.cloudflarestorage.com",
      accessKeyId: Redacted.make("access-key"),
      secretAccessKey: Redacted.make("secret-key"),
    })

    return Effect.gen(function* () {
      yield* client.putObject({
        bucket: "route-images",
        key: "gym-route-images/route-1.png",
        body,
        contentType: "image/png",
        contentLength: 3,
        cacheControl: "public, max-age=31536000",
      })

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
      expect(
        (commands[0] as PutObjectCommand | undefined)?.input
      ).toMatchObject({
        Bucket: "route-images",
        Key: "gym-route-images/route-1.png",
        Body: body,
        ContentType: "image/png",
        ContentLength: 3,
        CacheControl: "public, max-age=31536000",
      })
    })
  })

  it.effect("maps deleteObject input to DeleteObjectCommand", () => {
    const commands: unknown[] = []
    const client = S3ObjectClient.makeWithSdkClientFactory(() => ({
      send: (command) => {
        commands.push(command)
        return Promise.resolve({})
      },
    }))({
      region: "auto",
      endpoint: "https://account-123.r2.cloudflarestorage.com",
      accessKeyId: Redacted.make("access-key"),
      secretAccessKey: Redacted.make("secret-key"),
    })

    return Effect.gen(function* () {
      yield* client.deleteObject({
        bucket: "route-images",
        key: "gym-route-images/route-1.png",
      })

      expect(commands).toHaveLength(1)
      expect(commands[0]).toBeInstanceOf(DeleteObjectCommand)
      expect(
        (commands[0] as DeleteObjectCommand | undefined)?.input
      ).toMatchObject({
        Bucket: "route-images",
        Key: "gym-route-images/route-1.png",
      })
    })
  })
})

describe("R2", () => {
  it("formats Cloudflare account endpoints", () => {
    expect(R2.endpointForAccountId("account-123")).toBe(
      "https://account-123.r2.cloudflarestorage.com"
    )
  })
})
