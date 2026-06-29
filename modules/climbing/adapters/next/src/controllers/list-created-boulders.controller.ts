import { Effect, Schema } from "effect"
import { ListCreatedBouldersInputSchema } from "@climbing/application/use-cases/list-created-boulders"
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

        const input = yield* Schema.decodeUnknownEffect(
          ListCreatedBouldersInputSchema
        )(
          {
            token: authToken.value,
          },
          { errors: "all" }
        )

        const success = yield* climbing.listCreatedBoulders(input)

        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) => presenter.presentSchemaError(error),
        UnauthenticatedClimberError: () => redirectToSignIn,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError())
    ),
  }
})
