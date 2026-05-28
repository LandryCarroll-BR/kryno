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
  ReserveGymUserEmailInput,
  SignUpGymUserInput,
  VerifyGymUserEmailInput,
} from "../../domain/gym-user.ts"

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
    payload: ReserveGymUserEmailInput,
    success: GymUserRegistrationCreated,
    error: GymUserEmailAlreadyReservedConflict,
  }
)

export const SignUpGymUserEndpoint = HttpApiEndpoint.post(
  "signUpGymUser",
  "/gym-users/signups",
  {
    payload: SignUpGymUserInput,
    success: GymUserSignupSuccess.pipe(HttpApiSchema.status(201)),
    error: GymUserEmailAlreadyReservedConflict,
  }
)

export const VerifyGymUserEmailEndpoint = HttpApiEndpoint.post(
  "verifyGymUserEmail",
  "/gym-users/email-verifications",
  {
    payload: VerifyGymUserEmailInput,
    success: GymUserEmailVerificationSuccess,
    error: [GymUserEmailVerificationInvalidBadRequest, GymUserNotFoundNotFound],
  }
)
