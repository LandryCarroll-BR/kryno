import { Schema } from "effect"

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
const SessionTokenParts = [SessionId, ".", SessionSecret] as const

export const SessionToken = Schema.TemplateLiteral(SessionTokenParts).pipe(
  Schema.brand("SessionToken")
)

export const SessionTokenParser =
  Schema.TemplateLiteralParser(SessionTokenParts)
