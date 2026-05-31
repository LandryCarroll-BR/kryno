import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymUserNotFound,
  GymUserPasswordResetTokenAlreadyUsed,
  GymUserPasswordResetTokenExpired,
  GymUserPasswordResetTokenInvalid,
  GymUserPasswordResetUnknownEmail,
} from "../../domain/errors.ts"
import {
  GymUserPasswordResetCompleted,
  GymUserPasswordResetRequested,
} from "../../domain/gym-user.ts"

export const RequestGymUserPasswordResetPayload = Schema.Struct({
  email: Schema.String,
})

export const CompleteGymUserPasswordResetPayload = Schema.Struct({
  token: Schema.String,
  newPassword: Schema.String,
})

export const GymUserPasswordResetUnknownEmailNotFound =
  GymUserPasswordResetUnknownEmail.pipe(HttpApiSchema.status(404))

export const GymUserPasswordResetTokenInvalidBadRequest =
  GymUserPasswordResetTokenInvalid.pipe(HttpApiSchema.status(400))

export const GymUserPasswordResetTokenExpiredGone =
  GymUserPasswordResetTokenExpired.pipe(HttpApiSchema.status(410))

export const GymUserPasswordResetTokenAlreadyUsedConflict =
  GymUserPasswordResetTokenAlreadyUsed.pipe(HttpApiSchema.status(409))

export const GymUserPasswordResetUserNotFoundNotFound = GymUserNotFound.pipe(
  HttpApiSchema.status(404)
)

export const RequestGymUserPasswordResetEndpoint = HttpApiEndpoint.post(
  "requestGymUserPasswordReset",
  "/gym-users/password-resets",
  {
    payload: RequestGymUserPasswordResetPayload,
    success: GymUserPasswordResetRequested,
    error: GymUserPasswordResetUnknownEmailNotFound,
  }
)

export const CompleteGymUserPasswordResetEndpoint = HttpApiEndpoint.post(
  "completeGymUserPasswordReset",
  "/gym-users/password-resets/completions",
  {
    payload: CompleteGymUserPasswordResetPayload,
    success: GymUserPasswordResetCompleted,
    error: [
      GymUserPasswordResetTokenInvalidBadRequest,
      GymUserPasswordResetTokenExpiredGone,
      GymUserPasswordResetTokenAlreadyUsedConflict,
      GymUserPasswordResetUserNotFoundNotFound,
    ],
  }
)
