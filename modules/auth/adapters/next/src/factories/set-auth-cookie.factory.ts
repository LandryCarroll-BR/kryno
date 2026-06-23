import { Effect } from "effect"
import type { SessionWithToken } from "@auth/application"
import { Headers } from "@packages/effect-next"

import { AuthCookie } from "../models/auth-web.models"

export const SetAuthCookie = Effect.gen(function* () {
  const cookies = yield* Headers.Cookies

  return Effect.fn("SetAuthCookie.create")(function* ({
    session,
  }: {
    session: SessionWithToken
  }) {
    const authCookie = AuthCookie.make({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    })

    return cookies.set(AuthCookie.AUTH_COOKIE_NAME, session.token, authCookie)
  })
})
