import { Effect, Schema } from "effect"
import { ListGymRouteAttemptHistoryInputSchema } from "@gym/application/use-cases/list-gym-route-attempt-history"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { ListGymRouteAttemptHistoryPresenter } from "../presenters/list-gym-route-attempt-history.presenter"

export const ListGymRouteAttemptHistoryController = Effect.fn(
  "ListGymRouteAttemptHistoryController.make"
)(function* ({ gymId, redirectUrl }: { gymId: string; redirectUrl: string }) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* ListGymRouteAttemptHistoryPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("ListGymRouteAttemptHistoryController.handle")(
      function* () {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          ListGymRouteAttemptHistoryInputSchema
        )({ token: authToken.value, gymId }, { errors: "all" })
        const success = yield* gym.listGymRouteAttemptHistory(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) => presenter.presentSchemaError(error),
        UnauthenticatedGymMemberError: () => redirectToSignIn,
        GymNotFoundError: () => Navigation.NotFound,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError())
    ),
  }
})
