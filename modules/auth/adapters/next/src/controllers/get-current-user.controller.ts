import { Effect, Option } from "effect"
import { Auth } from "@auth/component"
import { Headers } from "@packages/effect-next"

export const GetCurrentUserController = Effect.fn(
  "GetCurrentUserController.make"
)(function* () {
  const auth = yield* Auth
  const cookies = yield* Headers.Cookies

  return {
    handle: Effect.fn("GetCurrentUserController.handle")(function* () {
      const authToken = cookies.get("authToken")

      if (!authToken?.value) {
        return Option.none()
      }

      return yield* auth.getCurrentUser({ token: authToken.value })
    }),
  }
})
