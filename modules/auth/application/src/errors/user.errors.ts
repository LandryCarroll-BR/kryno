import { Schema } from "effect"

export class UserAlreadyExistsError extends Schema.ErrorClass<UserAlreadyExistsError>(
  "UserAlreadyExistsError"
)({
  username: Schema.String,
}) {}
