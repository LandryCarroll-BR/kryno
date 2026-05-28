import { Effect, Layer } from "effect"

import {
  AuthEmailDelivery,
  type GymStaffInvitationDelivery,
  type GymUserEmailVerificationDelivery,
  type GymUserPasswordResetDelivery,
} from "../../ports/services/auth-email-delivery.ts"

export const AuthEmailDeliveryMemoryAdapter = Layer.sync(
  AuthEmailDelivery,
  () => {
    const emailVerificationTokens: Array<GymUserEmailVerificationDelivery> = []
    const passwordResetTokens: Array<GymUserPasswordResetDelivery> = []
    const staffInvitationTokens: Array<GymStaffInvitationDelivery> = []

    return {
      sendGymUserEmailVerification: (
        delivery: GymUserEmailVerificationDelivery
      ) =>
        Effect.sync(() => {
          emailVerificationTokens.push(delivery)
        }),
      sendGymUserPasswordReset: (delivery: GymUserPasswordResetDelivery) =>
        Effect.sync(() => {
          passwordResetTokens.push(delivery)
        }),
      sendGymStaffInvitation: (delivery: GymStaffInvitationDelivery) =>
        Effect.sync(() => {
          staffInvitationTokens.push(delivery)
        }),
      sentEmailVerificationTokens: Effect.sync(() => [
        ...emailVerificationTokens,
      ]),
      sentGymUserPasswordResetTokens: Effect.sync(() => [
        ...passwordResetTokens,
      ]),
      sentGymStaffInvitationTokens: Effect.sync(() => [
        ...staffInvitationTokens,
      ]),
    }
  }
)
