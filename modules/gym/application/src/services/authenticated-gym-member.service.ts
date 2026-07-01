import type { Effect } from "effect"
import { Service } from "effect/Context"

import type { UnauthenticatedGymMemberError } from "../errors/gym-membership.errors"
import type { GymMemberId } from "../models/gym-membership.models"

export class AuthenticatedGymMember extends Service<
  AuthenticatedGymMember,
  {
    readonly resolve: (
      token: string
    ) => Effect.Effect<GymMemberId, UnauthenticatedGymMemberError>
  }
>()("@gym/application/AuthenticatedGymMember") {}
