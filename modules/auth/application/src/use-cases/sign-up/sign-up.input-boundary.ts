import { Effect, Schema } from "effect"
import { Service } from "effect/Context"

import type { UserAlreadyExistsError } from "../../errors/user.errors"
import type { User } from "src/models/user.models"
import type { SessionCookie, SessionWithToken } from "src/models/session.models"

export const SignUpInputSchema = Schema.Struct({
  email: Schema.String,
  username: Schema.String,
  password: Schema.String,
})

export type SignUpInput = typeof SignUpInputSchema.Type

export class SignUpInputBoundary extends Service<
  SignUpInputBoundary,
  {
    execute: (
      input: SignUpInput
    ) => Effect.Effect<
      { user: User; session: SessionWithToken; cookie: SessionCookie },
      UserAlreadyExistsError
    >
  }
>()("@workspace/auth/application/use-cases/sign-up-input-boundary") {}
