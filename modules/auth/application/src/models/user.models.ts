import { Effect, Schema } from "effect"
import { NonEmptyString } from "effect/Schema"

export type UserId = typeof UserId.Type
export const UserId = NonEmptyString.pipe(Schema.brand("UserId"))

export type PasswordHash = typeof PasswordHash.Type
export const PasswordHash = Schema.Uint8Array.pipe(Schema.brand("PasswordHash"))

export const Role = Schema.Literals(["user", "admin"]).pipe(
  Schema.withConstructorDefault(Effect.succeed("user"))
)
export type Role = typeof Role.Type

export class User extends Schema.Class<User>("User")({
  id: UserId,
  username: Schema.String,
  email: Schema.String,
  passwordHash: PasswordHash,
  createdAt: Schema.Date,
  role: Role,
}) {}
