import crypto from "node:crypto"
import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { Effect, Layer } from "effect"
import {
  ClimbingAttemptVideoContentType,
  ClimbingAttemptVideoUrl,
} from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptVideoStorage } from "@climbing/application/services/climbing-attempt-video-storage"

const extensionByContentType = {
  "video/mp4": "mp4",
  "video/webm": "webm",
} satisfies Record<ClimbingAttemptVideoContentType, string>

const extensionFor = (contentType: ClimbingAttemptVideoContentType) =>
  extensionByContentType[contentType]

const storageRoot = () =>
  process.env.CLIMBING_ATTEMPT_VIDEO_STORAGE_ROOT ??
  path.join(process.cwd(), "public", "uploads", "climbing-attempt-videos")

const urlPrefix = () =>
  (
    process.env.CLIMBING_ATTEMPT_VIDEO_URL_PREFIX ??
    "/uploads/climbing-attempt-videos"
  ).replace(/\/$/, "")

const filenameFor = ({
  attemptId,
  contentType,
}: {
  readonly attemptId: string
  readonly contentType: ClimbingAttemptVideoContentType
}) =>
  `${attemptId}-${crypto.randomBytes(8).toString("hex")}.${extensionFor(
    contentType
  )}`

export const ClimbingAttemptVideoStorageLocal = Layer.succeed(
  ClimbingAttemptVideoStorage,
  {
    store: Effect.fn("ClimbingAttemptVideoStorage.store")(function* ({
      attemptId,
      video,
    }) {
      const root = storageRoot()
      const prefix = urlPrefix()
      const filename = filenameFor({
        attemptId,
        contentType: video.contentType,
      })

      yield* Effect.tryPromise(() => mkdir(root, { recursive: true })).pipe(
        Effect.orDie
      )
      yield* Effect.tryPromise(() =>
        writeFile(path.join(root, filename), video.bytes)
      ).pipe(Effect.orDie)

      return ClimbingAttemptVideoUrl.make(`${prefix}/${filename}`)
    }),
    delete: Effect.fn("ClimbingAttemptVideoStorage.delete")(
      function* (videoUrl) {
        const prefix = urlPrefix()
        const videoUrlString = String(videoUrl)
        if (!videoUrlString.startsWith(`${prefix}/`)) {
          return
        }

        const filename = videoUrlString.slice(prefix.length + 1)
        if (filename !== path.basename(filename)) {
          return
        }

        yield* Effect.tryPromise(() =>
          rm(path.join(storageRoot(), filename), { force: true })
        ).pipe(Effect.orDie)
      }
    ),
  }
)
