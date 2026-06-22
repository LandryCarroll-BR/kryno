import { Effect, Schema } from "effect"
import { NonEmptyString } from "effect/Schema"

export type UserId = typeof UserId.Type
export const UserId = NonEmptyString.pipe(Schema.brand("UserId"))

export const Username = Schema.Trim.pipe(
  Schema.check(
    Schema.isLengthBetween(3, 32, {
      message: "Username must be between 3 and 32 characters.",
    }),
    Schema.isPattern(/^[a-zA-Z0-9_]+$/, {
      message: "Username may only contain letters, numbers, and underscores.",
    })
  )
)
export type Username = typeof Username.Type

export const Email = Schema.Trim.pipe(
  Schema.check(
    Schema.isMaxLength(254, {
      message: "Email must be at most 254 characters.",
    }),
    Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Email must be a valid email address.",
    })
  )
)
export type Email = typeof Email.Type

export const Password = Schema.String.pipe(
  Schema.check(
    Schema.isLengthBetween(8, 128, {
      message: "Password must be between 8 and 128 characters.",
    })
  )
)
export type Password = typeof Password.Type

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

export class CurrentUser extends Schema.Class<CurrentUser>("CurrentUser")({
  id: UserId,
  username: Schema.String,
  email: Schema.String,
  createdAt: Schema.Date,
  role: Role,
}) {}
