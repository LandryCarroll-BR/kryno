import type { Effect } from "effect"
import { Service } from "effect/Context"

import type {
  ClimbingAttemptId,
  ClimbingAttemptVideoUpload,
  ClimbingAttemptVideoUrl,
} from "../models/climbing-attempt.models"

export class ClimbingAttemptVideoStorage extends Service<
  ClimbingAttemptVideoStorage,
  {
    readonly store: (input: {
      readonly attemptId: ClimbingAttemptId
      readonly video: ClimbingAttemptVideoUpload
    }) => Effect.Effect<ClimbingAttemptVideoUrl>
    readonly delete: (
      videoUrl: ClimbingAttemptVideoUrl
    ) => Effect.Effect<void>
  }
>()("@climbing/application/ClimbingAttemptVideoStorage") {}
