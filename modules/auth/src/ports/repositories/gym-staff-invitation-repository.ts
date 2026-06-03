import { Effect, Option } from "effect"
import * as Context from "effect/Context"
import type { PersistenceError } from "@workspace/drizzle"

import type { GymStaffInvitationRecord } from "../../domain/gym.ts"

export class GymStaffInvitationRepository extends Context.Service<
  GymStaffInvitationRepository,
  {
    readonly findByToken: (
      token: string
    ) => Effect.Effect<Option.Option<GymStaffInvitationRecord>, PersistenceError>
    readonly save: (
      invitation: GymStaffInvitationRecord
    ) => Effect.Effect<void, PersistenceError>
  }
>()("@kryno/auth/GymStaffInvitationRepository") {}
