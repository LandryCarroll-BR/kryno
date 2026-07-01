import { Schema } from "effect"

import { GymId } from "./gym.models"

export type GymMemberId = typeof GymMemberId.Type
export const GymMemberId = Schema.NonEmptyString.pipe(
  Schema.brand("GymMemberId")
)

export class GymMembership extends Schema.Class<GymMembership>("GymMembership")(
  {
    gymId: GymId,
    memberId: GymMemberId,
    joinedAt: Schema.Date,
  }
) {}
