import { Schema } from "effect"

export type UserId = typeof UserId.Type
export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"))

export class User extends Schema.Class<User>("User")({
  id: UserId,
  username: Schema.String,
  email: Schema.String,
  passwordHash: Schema.Uint8Array,
  createdAt: Schema.Date,
}) {}
