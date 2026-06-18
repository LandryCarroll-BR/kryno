import { SecureRandomString } from "./identity.models"
import { Schema } from "effect"

export type UserId = typeof UserId.Type
export const UserId = SecureRandomString.pipe(Schema.brand("UserId"))

export type PasswordHash = typeof PasswordHash.Type
export const PasswordHash = Schema.Uint8Array.pipe(Schema.brand("PasswordHash"))

export class User extends Schema.Class<User>("User")({
  id: UserId,
  username: Schema.String,
  email: Schema.String,
  passwordHash: PasswordHash,
  createdAt: Schema.Date,
}) {}
