import os from "node:os"
import path from "node:path"
import { mkdtemp, rm, stat } from "node:fs/promises"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import {
  ClimbingAttemptId,
  ClimbingAttemptVideoBytes,
  ClimbingAttemptVideoUrl,
} from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptVideoStorage } from "@climbing/application/services/climbing-attempt-video-storage"

import { ClimbingAttemptVideoStorageLocal } from "../src/services/climbing-attempt-video-storage-local.service"

describe("ClimbingAttemptVideoStorageLocal", () => {
  it("stores and deletes attempt videos within its configured prefix", async () => {
    const previousRoot = process.env.CLIMBING_ATTEMPT_VIDEO_STORAGE_ROOT
    const previousPrefix = process.env.CLIMBING_ATTEMPT_VIDEO_URL_PREFIX
    const root = await mkdtemp(
      path.join(os.tmpdir(), "kryno-attempt-videos-")
    )

    process.env.CLIMBING_ATTEMPT_VIDEO_STORAGE_ROOT = root
    process.env.CLIMBING_ATTEMPT_VIDEO_URL_PREFIX = "/test-attempt-videos"

    try {
      const url = await Effect.runPromise(
        Effect.gen(function* () {
          const storage = yield* ClimbingAttemptVideoStorage
          const stored = yield* storage.store({
            attemptId: ClimbingAttemptId.make("attempt-1"),
            video: {
              bytes: ClimbingAttemptVideoBytes.make(new Uint8Array([1, 2, 3])),
              contentType: "video/mp4",
              fileName: "../ignored.mp4",
            },
          })

          yield* storage.delete(
            ClimbingAttemptVideoUrl.make("/outside-prefix/video.mp4")
          )
          yield* storage.delete(
            ClimbingAttemptVideoUrl.make(
              "/test-attempt-videos/../escape.mp4"
            )
          )

          return stored
        }).pipe(Effect.provide(ClimbingAttemptVideoStorageLocal))
      )

      const filename = String(url).slice("/test-attempt-videos/".length)
      const storedPath = path.join(root, filename)

      expect(String(url)).toMatch(
        /^\/test-attempt-videos\/attempt-1-[a-f0-9]{16}\.mp4$/
      )
      await expect(stat(storedPath)).resolves.toMatchObject({ size: 3 })

      await Effect.runPromise(
        Effect.gen(function* () {
          const storage = yield* ClimbingAttemptVideoStorage
          yield* storage.delete(url)
        }).pipe(Effect.provide(ClimbingAttemptVideoStorageLocal))
      )

      await expect(stat(storedPath)).rejects.toMatchObject({
        code: "ENOENT",
      })
    } finally {
      if (previousRoot === undefined) {
        delete process.env.CLIMBING_ATTEMPT_VIDEO_STORAGE_ROOT
      } else {
        process.env.CLIMBING_ATTEMPT_VIDEO_STORAGE_ROOT = previousRoot
      }

      if (previousPrefix === undefined) {
        delete process.env.CLIMBING_ATTEMPT_VIDEO_URL_PREFIX
      } else {
        process.env.CLIMBING_ATTEMPT_VIDEO_URL_PREFIX = previousPrefix
      }

      await rm(root, { recursive: true, force: true })
    }
  })
})
