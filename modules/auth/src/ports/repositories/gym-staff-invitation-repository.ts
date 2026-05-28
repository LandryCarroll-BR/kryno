import { Effect, Option } from "effect"
import * as Context from "effect/Context"

import type { GymStaffInvitationRecord } from "../../domain/gym.ts"

export class GymStaffInvitationRepository extends Context.Service<
  GymStaffInvitationRepository,
  {
    readonly findByToken: (
      token: string
    ) => Effect.Effect<Option.Option<GymStaffInvitationRecord>>
    readonly save: (invitation: GymStaffInvitationRecord) => Effect.Effect<void>
  }
>()("@kryno/auth/GymStaffInvitationRepository") {}
