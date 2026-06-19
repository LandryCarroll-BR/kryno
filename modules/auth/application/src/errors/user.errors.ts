import { Data } from "effect"

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
