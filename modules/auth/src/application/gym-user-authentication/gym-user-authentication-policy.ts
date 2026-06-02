import { Clock, Effect, Option } from "effect"

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
import { isExpired } from "../../domain/auth-expiration.ts"

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
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis

    return Option.isSome(session) &&
      session.value.active &&
      !isExpired(now, session.value.expiresAtMillis)
      ? session.value
      : yield* new GymUserSessionInvalid({ sessionId })
  })
