import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import {
  GymUserEmailAlreadyReserved,
  GymUserEmailVerificationInvalid,
  GymUserNotFound,
} from "../../domain/errors.ts"
import {
  GymUserEmailVerificationSuccess,
  GymUserRegistrationRecord,
  GymUserSignupSuccess,
} from "../../domain/gym-user.ts"
import { PersistenceFailureInternalServerError } from "../persistence-error-response.ts"

export const ReserveGymUserEmailPayload = Schema.Struct({
  email: Schema.String,
  displayName: Schema.String,
})

export const SignUpGymUserPayload = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
  displayName: Schema.String,
})

export const VerifyGymUserEmailPayload = Schema.Struct({
  token: Schema.String,
})

export const GymUserRegistrationCreated = GymUserRegistrationRecord.pipe(
  HttpApiSchema.status(201)
)

export const GymUserEmailAlreadyReservedConflict =
  GymUserEmailAlreadyReserved.pipe(HttpApiSchema.status(409))

export const GymUserEmailVerificationInvalidBadRequest =
  GymUserEmailVerificationInvalid.pipe(HttpApiSchema.status(400))

export const GymUserNotFoundNotFound = GymUserNotFound.pipe(
  HttpApiSchema.status(404)
)

export const ReserveGymUserEmailEndpoint = HttpApiEndpoint.post(
  "reserveGymUserEmail",
  "/gym-users/email-reservations",
  {
    payload: ReserveGymUserEmailPayload,
    success: GymUserRegistrationCreated,
    error: [
      GymUserEmailAlreadyReservedConflict,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const SignUpGymUserEndpoint = HttpApiEndpoint.post(
  "signUpGymUser",
  "/gym-users/signups",
  {
    payload: SignUpGymUserPayload,
    success: GymUserSignupSuccess.pipe(HttpApiSchema.status(201)),
    error: [
      GymUserEmailAlreadyReservedConflict,
      PersistenceFailureInternalServerError,
    ],
  }
)

export const VerifyGymUserEmailEndpoint = HttpApiEndpoint.post(
  "verifyGymUserEmail",
  "/gym-users/email-verifications",
  {
    payload: VerifyGymUserEmailPayload,
    success: GymUserEmailVerificationSuccess,
    error: [
      GymUserEmailVerificationInvalidBadRequest,
      GymUserNotFoundNotFound,
      PersistenceFailureInternalServerError,
    ],
  }
)
