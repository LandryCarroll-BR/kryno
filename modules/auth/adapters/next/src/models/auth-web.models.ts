import { Schema } from "effect"

export class AuthCookie extends Schema.Class<AuthCookie>("AuthCookie")({
  httpOnly: Schema.Boolean,
  secure: Schema.Boolean,
  sameSite: Schema.Literals(["lax", "strict", "none"]),
  path: Schema.String,
  maxAge: Schema.Number,
}) {
  static readonly AUTH_COOKIE_NAME: string = "authToken"
}
