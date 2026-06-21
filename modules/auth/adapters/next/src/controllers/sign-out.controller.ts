import { Effect } from "effect"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"

export const SignOutController = Effect.fn("SignOutController.make")(
  function* ({ redirectUrl }: { redirectUrl?: string | undefined }) {
    const auth = yield* Auth
    const cookies = yield* Headers.Cookies

    return {
      handle: Effect.fn("SignOutController.handle")(function* () {
        const authToken = cookies.get("authToken")

        if (authToken?.value) {
          cookies.delete({ name: "authToken", path: "/" })
          yield* auth.signOut({ token: authToken.value })
        }

        return yield* Navigation.Redirect(redirectUrl || "/")
      }),
    }
  }
)
