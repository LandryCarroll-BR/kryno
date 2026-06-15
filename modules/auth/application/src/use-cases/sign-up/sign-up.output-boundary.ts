import { SessionId } from "@/session/session.models"
import { UserId } from "@/user/user.models"
import { Effect, Schema } from "effect"
import { Service } from "effect/Context"

export const SignInOutputSchema = Schema.Struct({
  user: Schema.Struct({
    id: UserId,
    username: Schema.String,
  }),
  session: Schema.Struct({
    id: SessionId,
    userId: UserId,
    expiresAt: Schema.Date,
  }),
})

export type SignInOutput = typeof SignInOutputSchema.Type

export class SignInOutputBoundary extends Service<
  SignInOutputBoundary,
  {
    present: (output: SignInOutput) => Effect.Effect<unknown>
  }
>()(
  "@auth/application/use-cases/sign-in/sign-in.output-boundary/SignInOutputBoundary"
) {}
