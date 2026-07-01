import type { Effect, Option } from "effect"
import { Service } from "effect/Context"

import type {
  GymMemberId,
  GymMembership,
} from "../models/gym-membership.models"

export class GymMembershipRepository extends Service<
  GymMembershipRepository,
  {
    readonly findByMemberId: (
      memberId: GymMemberId
    ) => Effect.Effect<readonly GymMembership[]>
    readonly insert: (
      membership: GymMembership
    ) => Effect.Effect<Option.Option<GymMembership>>
  }
>()("@gym/application/GymMembershipRepository") {}
