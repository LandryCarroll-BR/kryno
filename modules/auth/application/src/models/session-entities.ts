import { DateTime, Effect, Equivalence, Schema } from "effect"

import {
  SessionId,
  SessionSecret,
  SessionSecretHash,
  SessionToken,
  SessionTokenParser,
} from "@/models/session-value-objects"

export class Session extends Schema.Class<Session>("Session")({
  id: SessionId,
  secretHash: SessionSecretHash,
  lastVerifiedAt: Schema.Date,
  createdAt: Schema.Date,
}) {
  readonly ACTIVITY_CHECK_INTERVAL_SECONDS = 60 * 60 // 1 hour
  readonly INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10 // 10 days

  isExpired = Effect.fn("session/is-expired")(function* (this: Session) {
    const now = yield* DateTime.nowAsDate
    return (
      now.getTime() - this.lastVerifiedAt.getTime() >=
      this.INACTIVITY_TIMEOUT_SECONDS * 1000
    )
  })

  isInactive = Effect.fn("session/is-inactive")(function* (this: Session) {
    const now = yield* DateTime.nowAsDate
    return (
      now.getTime() - this.lastVerifiedAt.getTime() >=
      this.ACTIVITY_CHECK_INTERVAL_SECONDS * 1000
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

export class ParsedSessionToken extends Schema.Class<ParsedSessionToken>(
  "ParsedSessionToken"
)({
  id: SessionId,
  secret: SessionSecret,
}) {
  static fromString = Effect.fn("parsed-session-token/from-string")(function* (
    token: string
  ) {
    const [id, _, secret] =
      yield* Schema.decodeUnknownEffect(SessionTokenParser)(token)

    return new ParsedSessionToken({ id, secret })
  })

  get token() {
    return SessionToken.make(`${this.id}.${this.secret}`)
  }
}
