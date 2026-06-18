import { Schema } from "effect"

const SecureRandomStringPattern = /^[abcdefghijkmnpqrstuvwxyz23456789]{24}$/

export type SecureRandomString = typeof SecureRandomString.Type
export const SecureRandomString = Schema.String.pipe(
  Schema.check(
    Schema.isPattern(SecureRandomStringPattern, {
      identifier: "SecureRandomString",
      description: "a 24-character secure random string",
    })
  )
)
