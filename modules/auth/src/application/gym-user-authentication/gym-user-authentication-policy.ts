import { Effect, Option } from "effect"

import {
  GymUserInvalidCredentials,
  GymUserSessionInvalid,
  GymUserUnverified,
} from "../../domain/errors.ts"
import type {
  GymUserCredentialRecord,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
} from "../../domain/gym-user.ts"

export const requireGymUserCredential = (
  email: string,
  user: Option.Option<GymUserRegistrationRecord>,
  credential: Option.Option<GymUserCredentialRecord>
) =>
  Option.isSome(user) && Option.isSome(credential)
    ? Effect.succeed({ user: user.value, credential: credential.value })
    : Effect.fail(new GymUserInvalidCredentials({ email }))

export const requireVerifiedGymUser = (user: GymUserRegistrationRecord) =>
  user.emailVerified
    ? Effect.succeed(user)
    : Effect.fail(new GymUserUnverified({ userId: user.id }))

export const requireActiveGymUserSession = (
  sessionId: GymUserSessionId,
  session: Option.Option<GymUserSessionRecord>
) =>
  Option.isSome(session) && session.value.active
    ? Effect.succeed(session.value)
    : Effect.fail(new GymUserSessionInvalid({ sessionId }))
