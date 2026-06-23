import { Data } from "effect"

export class UserEmailNotFoundError extends Data.TaggedError(
  "UserEmailNotFoundError"
)<{
  readonly email: string
}> {
  override message: string = `No user found with the email "${this.email}".`
}

export class UserPasswordInvalidError extends Data.TaggedError(
  "UserPasswordInvalidError"
)<{
  readonly email: string
}> {
  override message: string = `The password provided for the email "${this.email}" is invalid.`
}

export class UserEmailAlreadyExistsError extends Data.TaggedError(
  "UserEmailAlreadyExistsError"
)<{
  readonly email: string
}> {
  override message: string = `An account with the email "${this.email}" already exists.`
}

export class UsernameAlreadyExistsError extends Data.TaggedError(
  "UsernameAlreadyExistsError"
)<{
  readonly username: string
}> {
  override message: string = `Username "${this.username}" already exists.`
}
