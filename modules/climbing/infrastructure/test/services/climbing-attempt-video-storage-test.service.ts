import { Effect, Layer } from "effect"
import { ClimbingAttemptVideoUrl } from "@climbing/application/models/climbing-attempt"
import { ClimbingAttemptVideoStorage } from "@climbing/application/services/climbing-attempt-video-storage"

export const ClimbingAttemptVideoStorageTest = Layer.succeed(
  ClimbingAttemptVideoStorage,
  {
    store: Effect.fn("ClimbingAttemptVideoStorage.store")(
      ({ attemptId, video }) =>
        Effect.succeed(
          ClimbingAttemptVideoUrl.make(
            `/uploads/climbing-attempt-videos/${attemptId}.${video.contentType === "video/mp4" ? "mp4" : "webm"}`
          )
        )
    ),
    delete: Effect.fn("ClimbingAttemptVideoStorage.delete")(() => Effect.void),
  }
)
