import { Effect, Schema } from "effect"

export type SessionId = typeof SessionId.Type
export const SessionId = Schema.NonEmptyString.pipe(Schema.brand("SessionId"))

export type SessionSecretHash = typeof SessionSecretHash.Type
export const SessionSecretHash = Schema.Uint8Array.pipe(
  Schema.brand("SessionSecretHash")
)

export type SessionSecret = typeof SessionSecret.Type
export const SessionSecret = Schema.NonEmptyString.pipe(
  Schema.brand("SessionSecret")
)

export type SessionToken = typeof SessionToken.Type
export const SessionToken = Schema.TemplateLiteral([
  SessionId,
  ".",
  SessionSecret,
]).pipe(Schema.brand("SessionToken"))

export const SessionTokenParser = Schema.TemplateLiteralParser([
  SessionId,
  ".",
  SessionSecret,
])

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
