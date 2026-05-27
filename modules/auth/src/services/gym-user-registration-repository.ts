import { Effect, Option } from "effect"
import * as Context from "effect/Context"

import type { GymUserRegistrationRecord } from "../domain/index.ts"

export class GymUserRegistrationRepository extends Context.Tag(
  "@kryno/auth/GymUserRegistrationRepository"
)<
  GymUserRegistrationRepository,
  {
    readonly findByEmail: (
      email: string
    ) => Effect.Effect<Option.Option<GymUserRegistrationRecord>>
    readonly save: (record: GymUserRegistrationRecord) => Effect.Effect<void>
  }
>() {}
