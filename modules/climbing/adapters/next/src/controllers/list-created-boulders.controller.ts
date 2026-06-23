import { Effect } from "effect"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { ListCreatedBouldersPresenter } from "../presenters/list-created-boulders.presenter"

export const ListCreatedBouldersController = Effect.fn(
  "ListCreatedBouldersController.make"
)(function* ({ redirectUrl }: { redirectUrl: string }) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* ListCreatedBouldersPresenter

  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("ListCreatedBouldersController.handle")(
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const boulders = yield* climbing.listCreatedBoulders({
          token: authToken.value,
        })

        return yield* presenter.present(boulders)
      },
      Effect.catchTags({
        SchemaError: () => redirectToSignIn,
        UnauthenticatedClimberError: () => redirectToSignIn,
      })
    ),
  }
})
