import { Clock, Effect, Layer, Option } from "effect"

import {
  GymAffiliationRecord,
  GymStaffInvitationAccepted,
  GymStaffInvitationCreated,
  GymStaffInvitationRecord,
  type AcceptGymStaffInvitationInput,
  type CreateGymStaffInvitationInput,
} from "../../domain/gym.ts"
import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  GymStaffInvitationInvalid,
  GymStaffSelfAssignmentDenied,
  GymUserSessionInvalid,
} from "../../domain/errors.ts"
import { GymRepository } from "../../ports/repositories/gym-repository.ts"
import { GymStaffInvitationRepository } from "../../ports/repositories/gym-staff-invitation-repository.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { AuthEmailDelivery } from "../../ports/services/auth-email-delivery.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { AuthTokenDigester } from "../../ports/services/auth-token-digester.ts"
import { AuthTokenGenerator } from "../../ports/services/auth-token-generator.ts"
import {
  expiresAtMillis,
  gymStaffInvitationTtlMillis,
  isExpired,
} from "../../domain/auth-expiration.ts"
import { requireVerifiedGymUser } from "../gym-user-authentication/gym-user-authentication-policy.ts"
import {
  requireActiveGym,
  requireActiveOwnerAffiliation,
} from "../gym-request/gym-request-policy.ts"
import { GymStaffInvitation } from "./gym-staff-invitation-input-boundary.ts"

export const GymStaffInvitationInteractor = Layer.effect(
  GymStaffInvitation,
  Effect.gen(function* () {
    const emails = yield* AuthEmailDelivery
    const gymRepository = yield* GymRepository
    const gymUserRepository = yield* GymUserRegistrationRepository
    const invitationRepository = yield* GymStaffInvitationRepository
    const ids = yield* AuthIdGenerator
    const tokenDigester = yield* AuthTokenDigester
    const tokens = yield* AuthTokenGenerator

    const requireCurrentVerifiedGymUser = (
      sessionId: CreateGymStaffInvitationInput["sessionId"]
    ) =>
      Effect.gen(function* () {
        const maybeSession = yield* gymUserRepository.findSessionByTokenDigest(
          yield* tokenDigester.digestToken(sessionId)
        )
        const now = yield* Clock.currentTimeMillis

        if (
          Option.isNone(maybeSession) ||
          !maybeSession.value.active ||
          isExpired(now, maybeSession.value.expiresAtMillis)
        ) {
          return yield* new GymUserSessionInvalid({ sessionId })
        }

        const maybeUser = yield* gymUserRepository.findById(
          maybeSession.value.userId
        )

        if (Option.isNone(maybeUser)) {
          return yield* new GymUserSessionInvalid({ sessionId })
        }

        return yield* requireVerifiedGymUser(maybeUser.value)
      })

    const create = Effect.fn("GymStaffInvitation.create")(
      (command: CreateGymStaffInvitationInput) =>
        Effect.gen(function* () {
          const invitedEmail = normalizeEmailIdentity(command.email)
          const owner = yield* requireCurrentVerifiedGymUser(command.sessionId)
          const gym = yield* requireActiveGym(
            command.gymId,
            yield* gymRepository.findGymById(command.gymId)
          )

          yield* requireActiveOwnerAffiliation(
            command.gymId,
            owner.id,
            yield* gymRepository.findAffiliation(command.gymId, owner.id)
          )

          const now = yield* Clock.currentTimeMillis
          const maybeInvitedUser =
            yield* gymUserRepository.findByEmail(invitedEmail)

          if (
            Option.isSome(maybeInvitedUser) &&
            maybeInvitedUser.value.id === owner.id
          ) {
            return yield* new GymStaffSelfAssignmentDenied({
              gymId: command.gymId,
              userId: owner.id,
            })
          }

          const invitation = new GymStaffInvitationRecord({
            id: yield* ids.nextGymStaffInvitationId,
            gymId: command.gymId,
            invitedEmail,
            invitedByUserId: owner.id,
            token: yield* tokens.nextGymStaffInvitationToken,
            expiresAtMillis: expiresAtMillis(now, gymStaffInvitationTtlMillis),
            status: "pending",
          })

          yield* invitationRepository.save(invitation)
          yield* emails.sendGymStaffInvitation({
            email: invitation.invitedEmail,
            token: invitation.token,
            gymId: invitation.gymId,
          })

          return new GymStaffInvitationCreated({ gym, invitation })
        })
    )

    const accept = Effect.fn("GymStaffInvitation.accept")(
      (command: AcceptGymStaffInvitationInput) =>
        Effect.gen(function* () {
          const user = yield* requireCurrentVerifiedGymUser(command.sessionId)
          const maybeInvitation = yield* invitationRepository.findByToken(
            command.token
          )
          const now = yield* Clock.currentTimeMillis

          if (
            Option.isNone(maybeInvitation) ||
            maybeInvitation.value.status !== "pending" ||
            isExpired(now, maybeInvitation.value.expiresAtMillis) ||
            normalizeEmailIdentity(maybeInvitation.value.invitedEmail) !==
              normalizeEmailIdentity(user.email)
          ) {
            return yield* new GymStaffInvitationInvalid({
              token: command.token,
            })
          }

          const invitation = maybeInvitation.value
          const gym = yield* requireActiveGym(
            invitation.gymId,
            yield* gymRepository.findGymById(invitation.gymId)
          )

          if (invitation.invitedByUserId === user.id) {
            return yield* new GymStaffSelfAssignmentDenied({
              gymId: invitation.gymId,
              userId: user.id,
            })
          }

          const affiliation = new GymAffiliationRecord({
            gymId: invitation.gymId,
            userId: user.id,
            role: "Staff",
            status: "active",
          })
          const acceptedInvitation = new GymStaffInvitationRecord({
            id: invitation.id,
            gymId: invitation.gymId,
            invitedEmail: invitation.invitedEmail,
            invitedByUserId: invitation.invitedByUserId,
            token: invitation.token,
            expiresAtMillis: invitation.expiresAtMillis,
            status: "accepted",
          })

          yield* gymRepository.saveAffiliation(affiliation)
          yield* invitationRepository.save(acceptedInvitation)

          return new GymStaffInvitationAccepted({
            gym,
            invitation: acceptedInvitation,
            affiliation,
          })
        })
    )

    return { create, accept }
  })
)
