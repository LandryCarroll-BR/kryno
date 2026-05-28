import { Effect, Layer, Option } from "effect"

import type { GymStaffInvitationRecord } from "../../domain/gym.ts"
import { GymStaffInvitationRepository } from "../../ports/repositories/gym-staff-invitation-repository.ts"

export const GymStaffInvitationRepositoryMemoryAdapter = Layer.sync(
  GymStaffInvitationRepository,
  () => {
    const invitationsByToken = new Map<string, GymStaffInvitationRecord>()

    return {
      findByToken: (token: string) =>
        Effect.sync(() => Option.fromNullishOr(invitationsByToken.get(token))),
      save: (invitation: GymStaffInvitationRecord) =>
        Effect.sync(() => {
          invitationsByToken.set(invitation.token, invitation)
        }),
    }
  }
)
