import { SessionCookie, SessionWithToken } from "../../models/session.models"
import { User } from "../../models/user.models"
import { Effect, Schema } from "effect"
import { Service } from "effect/Context"

export const SignUpOutputSchema = Schema.Struct({
  user: User,
  session: SessionWithToken,
  cookie: SessionCookie,
})

export type SignUpOutput = typeof SignUpOutputSchema.Type

export class SignUpOutputBoundary extends Service<
  SignUpOutputBoundary,
  {
    present: (output: SignUpOutput) => Effect.Effect<unknown>
  }
>()(
  "@auth/application/use-cases/sign-in/sign-in.output-boundary/SignUpOutputBoundary"
) {}
