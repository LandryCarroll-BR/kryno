import { DateTime, Effect, Equivalence, Schema } from "effect"

const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 // 1 day

export const SessionId = Schema.NonEmptyString.pipe(Schema.brand("SessionId"))

export const SessionSecretHash = Schema.Uint8Array.pipe(
  Schema.brand("SessionSecretHash")
)
export const sessionSecretHashIsEqual = Equivalence.make<SessionSecretHash>(
  (a, b) => {
    if (a.byteLength !== b.byteLength) {
      return false
    }
    let c = 0
    for (let i = 0; i < a.byteLength; i++) {
      c |= a[i] ^ b[i]
    }
    return c === 0
  }
)

export const SessionSecret = Schema.NonEmptyString.pipe(
  Schema.brand("SessionSecret")
)

export const SessionToken = Schema.TemplateLiteral([
  SessionId,
  ".",
  SessionSecret,
]).pipe(Schema.brand("SessionToken"))

export const SessionTokenParts = Schema.TemplateLiteralParser([
  SessionId,
  ".",
  SessionSecret,
])

export const SessionTokenStruct = Schema.Struct({
  id: SessionId,
  secret: SessionSecret,
})

export const sessionStructFromToken = (token: string) =>
  Schema.decodeUnknownEffect(SessionTokenParts)(token).pipe(
    Effect.map(([id, _, secret]) => SessionTokenStruct.make({ id, secret }))
  )

export class Session extends Schema.Class<Session>("Session")({
  id: SessionId,
  secretHash: SessionSecretHash,
  createdAt: Schema.Date,
}) {}

export const sessionIsExpired = Effect.fn("session-is-expired")(function* (
  session: Session
) {
  const now = yield* DateTime.nowAsDate
  return (
    now.getTime() - session.createdAt.getTime() >=
    SESSION_EXPIRES_IN_SECONDS * 1000
  )
})

export class SessionWithToken extends Schema.Class<SessionWithToken>(
  "SessionWithToken"
)({
  ...Session.fields,
  token: SessionToken,
}) {}

export type SessionId = typeof SessionId.Type
export type SessionSecretHash = typeof SessionSecretHash.Type
export type SessionSecret = typeof SessionSecret.Type
export type SessionToken = typeof SessionToken.Type
