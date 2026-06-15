import { Effect, Schema } from "effect"
import { Service } from "effect/Context"

export const SignInInputSchema = Schema.Struct({
  email: Schema.String,
  username: Schema.String,
  password: Schema.String,
})

export type SignInInput = typeof SignInInputSchema.Type

export class SignInInputBoundary extends Service<
  SignInInputBoundary,
  {
    execute: (input: SignInInput) => Effect.Effect<unknown>
  }
>()("@workspace/auth/application/use-cases/sign-in-input-boundary") {}
