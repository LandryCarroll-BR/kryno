import { DateTime, Effect, Equivalence, Schema } from "effect"

import {
  SessionId,
  SessionSecretHash,
  SessionToken,
} from "@/domain/session-value-objects"

export class Session extends Schema.Class<Session>("Session")({
  id: SessionId,
  secretHash: SessionSecretHash,
  createdAt: Schema.Date,
}) {
  readonly SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24

  isExpired = Effect.fn("session/is-expired")(function* (this: Session) {
    const now = yield* DateTime.nowAsDate
    return (
      now.getTime() - this.createdAt.getTime() >=
      this.SESSION_EXPIRES_IN_SECONDS * 1000
    )
  })

  hasSecretHash(secretHash: SessionSecretHash) {
    return this.isEqual(secretHash, this.secretHash)
  }

  isEqual = Equivalence.make<SessionSecretHash>((a, b) => {
    if (a.byteLength !== b.byteLength) {
      return false
    }
    let c = 0
    for (let i = 0; i < a.byteLength; i++) {
      c |= a[i] ^ b[i]
    }
    return c === 0
  })
}

export class SessionWithToken extends Schema.Class<SessionWithToken>(
  "SessionWithToken"
)({
  ...Session.fields,
  token: SessionToken,
}) {}
