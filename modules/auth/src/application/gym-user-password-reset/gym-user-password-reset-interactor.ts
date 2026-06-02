import { Clock, Effect, Layer, Option } from "effect"

import {
  GymUserNotFound,
  GymUserPasswordResetTokenAlreadyUsed,
  GymUserPasswordResetTokenExpired,
  GymUserPasswordResetTokenInvalid,
  GymUserPasswordResetUnknownEmail,
} from "../../domain/errors.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  GymUserCredentialRecord,
  GymUserPasswordResetCompleted,
  GymUserPasswordResetRequested,
  GymUserPasswordResetTokenRecord,
  type CompleteGymUserPasswordResetInput,
  type RequestGymUserPasswordResetInput,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthEmailDelivery } from "../../ports/services/auth-email-delivery.ts"
import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import { GymUserPasswordReset } from "./gym-user-password-reset-input-boundary.ts"

const passwordResetTokenTtlMillis = 60 * 60 * 1000

export const GymUserPasswordResetInteractor = Layer.effect(
  GymUserPasswordReset,
  Effect.gen(function* () {
    const emailDelivery = yield* AuthEmailDelivery
    const passwordHasher = yield* PasswordHasher
    const repository = yield* GymUserRegistrationRepository
    const tokens = yield* AuthTokenGenerator

    const request = Effect.fn("GymUserPasswordReset.request")(
      (command: RequestGymUserPasswordResetInput) =>
        Effect.gen(function* () {
          const email = normalizeEmailIdentity(command.email)
          const maybeUser = yield* repository.findByEmail(email)

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserPasswordResetUnknownEmail({
              email,
            })
          }

          const now = yield* Clock.currentTimeMillis
          const token = yield* tokens.nextGymUserPasswordResetToken

          yield* repository.savePasswordResetToken(
            new GymUserPasswordResetTokenRecord({
              token,
              userId: maybeUser.value.id,
              expiresAtMillis: now + passwordResetTokenTtlMillis,
              used: false,
            })
          )
          yield* emailDelivery.sendGymUserPasswordReset({
            email: maybeUser.value.email,
            token,
          })

          return new GymUserPasswordResetRequested({
            email: maybeUser.value.email,
          })
        })
    )

    const complete = Effect.fn("GymUserPasswordReset.complete")(
      (command: CompleteGymUserPasswordResetInput) =>
        Effect.gen(function* () {
          const maybeToken = yield* repository.findPasswordResetToken(
            command.token
          )

          if (Option.isNone(maybeToken)) {
            return yield* new GymUserPasswordResetTokenInvalid({
              token: command.token,
            })
          }

          if (maybeToken.value.used) {
            return yield* new GymUserPasswordResetTokenAlreadyUsed({
              token: command.token,
            })
          }

          const now = yield* Clock.currentTimeMillis

          if (now >= maybeToken.value.expiresAtMillis) {
            return yield* new GymUserPasswordResetTokenExpired({
              token: command.token,
            })
          }

          const maybeUser = yield* repository.findById(maybeToken.value.userId)

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserNotFound({
              userId: maybeToken.value.userId,
            })
          }

          yield* repository.saveCredential(
            new GymUserCredentialRecord({
              userId: maybeUser.value.id,
              passwordHash: yield* passwordHasher.hashPassword(
                command.newPassword
              ),
            })
          )
          yield* repository.savePasswordResetToken(
            new GymUserPasswordResetTokenRecord({
              token: maybeToken.value.token,
              userId: maybeToken.value.userId,
              expiresAtMillis: maybeToken.value.expiresAtMillis,
              used: true,
            })
          )

          return new GymUserPasswordResetCompleted({ user: maybeUser.value })
        })
    )

    return { request, complete }
  })
)
