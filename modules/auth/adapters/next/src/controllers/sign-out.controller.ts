import { Effect } from "effect"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"

export const SignOutController = Effect.fn("SignOutController.make")(
  function* () {
    const auth = yield* Auth
    const cookies = yield* Headers.Cookies

    return {
      handle: Effect.fn("SignOutController.handle")(function* () {
        const authToken = cookies.get("authToken")

        if (authToken?.value) {
          yield* auth.signOut({ token: authToken.value }).pipe(
            Effect.catchCause((cause) =>
              Effect.logError("Failed to revoke session during sign-out", cause)
            )
          )
        }

        cookies.delete({ name: "authToken", path: "/" })
        return yield* Navigation.Redirect("/sign-in")
      }),
    }
  }
)
