import { Effect, Option } from "effect"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"
import { SignOutPresenter } from "../presenters/sign-out.presenter"

export const SignOutController = Effect.fn("SignOutController.make")(
  function* ({ redirectUrl }: { redirectUrl?: string | undefined }) {
    const auth = yield* Auth
    const cookies = yield* Headers.Cookies
    const signOutPresenter = yield* SignOutPresenter

    const deleteCookieAndRedirect = Effect.fn(
      "SignOutController.deleteCookieAndRedirect"
    )(function* () {
      cookies.delete("authToken")
      return yield* Navigation.Redirect(redirectUrl || "/")
    })

    return {
      handle: Effect.fn("SignOutController.handle")(
        function* () {
          const authToken = cookies.get("authToken")
          if (!authToken?.value) {
            return yield* Navigation.Redirect(redirectUrl || "/")
          }

          const session = yield* auth.validateSession({
            token: authToken.value,
          })
          if (Option.isNone(session)) {
            return yield* signOutPresenter.presentError()
          }

          yield* auth.signOut({ sessionId: authToken.value })

          return yield* deleteCookieAndRedirect()
        },
        Effect.catchTags({
          InvalidSessionSecretHashError: () => deleteCookieAndRedirect(),
          InvalidSessionTokenError: () => deleteCookieAndRedirect(),
          SessionNotFoundError: () => deleteCookieAndRedirect(),
        })
      ),
    }
  }
)
