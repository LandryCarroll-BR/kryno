import { Effect } from "effect"
import { Headers } from "@packages/effect-next"

import { AuthCookie } from "../models/auth-web.models"

export const DeleteAuthCookie = Effect.gen(function* () {
  const cookies = yield* Headers.Cookies

  return Effect.fn("SetAuthCookie.create")(function* ({}: {}) {
    return cookies.delete(AuthCookie.AUTH_COOKIE_NAME)
  })
})
