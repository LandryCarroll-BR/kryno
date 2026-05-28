import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi"

import { GymUserEmailAlreadyReserved } from "../../domain/errors.ts"
import {
  GymUserRegistrationRecord,
  ReserveGymUserEmailInput,
} from "../../domain/gym-user.ts"

export const GymUserRegistrationCreated = GymUserRegistrationRecord.pipe(
  HttpApiSchema.status(201)
)

export const GymUserEmailAlreadyReservedConflict =
  GymUserEmailAlreadyReserved.pipe(HttpApiSchema.status(409))

export const ReserveGymUserEmailEndpoint = HttpApiEndpoint.post(
  "reserveGymUserEmail",
  "/gym-users/email-reservations",
  {
    payload: ReserveGymUserEmailInput,
    success: GymUserRegistrationCreated,
    error: GymUserEmailAlreadyReservedConflict,
  }
)
