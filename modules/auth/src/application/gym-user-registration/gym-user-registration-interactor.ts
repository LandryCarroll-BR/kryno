import { Effect, Layer } from "effect"
import { Option } from "effect"

import {
  GymUserEmailVerificationInvalid,
  GymUserNotFound,
} from "../../domain/errors.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  GymUserCredentialRecord,
  GymUserEmailVerificationSuccess,
  GymUserEmailVerificationTokenRecord,
  GymUserRegistrationRecord,
  GymUserSignupSuccess,
  type ReserveGymUserEmailInput,
  type SignUpGymUserInput,
  type VerifyGymUserEmailInput,
} from "../../domain/gym-user.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthEmailDelivery } from "../../ports/services/auth-email-delivery.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"
import { PasswordHasher } from "../../ports/services/password-hasher.ts"
import { GymUserRegistration } from "./gym-user-registration-input-boundary.ts"
import { ensureGymUserEmailCanBeReserved } from "./gym-user-registration-policy.ts"

export const GymUserRegistrationInteractor = Layer.effect(
  GymUserRegistration,
  Effect.gen(function* () {
    const emailDelivery = yield* AuthEmailDelivery
    const ids = yield* AuthIdGenerator
    const passwordHasher = yield* PasswordHasher
    const repository = yield* GymUserRegistrationRepository
    const tokens = yield* AuthTokenGenerator

    const signUp = Effect.fn("GymUserRegistration.signUp")(
      (command: SignUpGymUserInput) =>
        Effect.gen(function* () {
          const email = normalizeEmailIdentity(command.email)
          const existing = yield* repository.findByEmail(email)

          yield* ensureGymUserEmailCanBeReserved(email, existing)

          const user = new GymUserRegistrationRecord({
            id: yield* ids.nextGymUserId,
            email,
            displayName: command.displayName,
            emailVerified: false,
          })
          const credential = new GymUserCredentialRecord({
            userId: user.id,
            passwordHash: yield* passwordHasher.hashPassword(command.password),
          })
          const token = yield* tokens.nextGymUserEmailVerificationToken

          yield* repository.save(user)
          yield* repository.saveCredential(credential)
          yield* repository.saveEmailVerificationToken(
            new GymUserEmailVerificationTokenRecord({
              token,
              userId: user.id,
              used: false,
            })
          )
          yield* emailDelivery.sendGymUserEmailVerification({
            email: user.email,
            token,
          })

          return new GymUserSignupSuccess({ user })
        })
    )

    const reserveEmail = Effect.fn("GymUserRegistration.reserveEmail")(
      (command: ReserveGymUserEmailInput) =>
        Effect.gen(function* () {
          const email = normalizeEmailIdentity(command.email)
          const existing = yield* repository.findByEmail(email)

          yield* ensureGymUserEmailCanBeReserved(email, existing)

          const record = new GymUserRegistrationRecord({
            id: yield* ids.nextGymUserId,
            email,
            displayName: command.displayName,
            emailVerified: false,
          })

          yield* repository.save(record)

          return record
        })
    )

    const verifyEmail = Effect.fn("GymUserRegistration.verifyEmail")(
      (command: VerifyGymUserEmailInput) =>
        Effect.gen(function* () {
          const maybeToken = yield* repository.findEmailVerificationToken(
            command.token
          )

          if (Option.isNone(maybeToken) || maybeToken.value.used) {
            return yield* new GymUserEmailVerificationInvalid({
              token: command.token,
            })
          }

          const maybeUser = yield* repository.findById(maybeToken.value.userId)

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserNotFound({
              userId: maybeToken.value.userId,
            })
          }

          const verifiedUser = new GymUserRegistrationRecord({
            id: maybeUser.value.id,
            email: maybeUser.value.email,
            displayName: maybeUser.value.displayName,
            emailVerified: true,
          })

          yield* repository.save(verifiedUser)
          yield* repository.saveEmailVerificationToken(
            new GymUserEmailVerificationTokenRecord({
              token: maybeToken.value.token,
              userId: maybeToken.value.userId,
              used: true,
            })
          )

          return new GymUserEmailVerificationSuccess({
            user: verifiedUser,
          })
        })
    )

    return { reserveEmail, signUp, verifyEmail }
  })
)
