import { Effect, Schema } from "effect"
import { LogGymRouteAttemptInputSchema } from "@gym/application/use-cases/log-gym-route-attempt"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { LogGymRouteAttemptPresenter } from "../presenters/log-gym-route-attempt.presenter"
import type { LogGymRouteAttemptViewModel } from "../view-models/log-gym-route-attempt.view-model"

export const LogGymRouteAttemptController = Effect.fn(
  "LogGymRouteAttemptController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: LogGymRouteAttemptViewModel
  redirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* LogGymRouteAttemptPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("LogGymRouteAttemptController.handle")(
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const videoFile = formData.get("video")
        const video =
          videoFile instanceof File && videoFile.size > 0
            ? {
                bytes: new Uint8Array(
                  yield* Effect.tryPromise(() =>
                    videoFile.arrayBuffer()
                  ).pipe(Effect.orDie)
                ),
                contentType: videoFile.type,
                fileName: videoFile.name || "attempt-video",
              }
            : undefined
        const formValues = Object.fromEntries(formData)
        delete formValues.video

        const input = yield* Schema.decodeUnknownEffect(
          LogGymRouteAttemptInputSchema
        )(
          {
            token: authToken.value,
            ...formValues,
            moveTypes: formData.getAll("moveTypes"),
            ...(video === undefined ? {} : { video }),
          },
          { errors: "all" }
        )
        const success = yield* gym.logGymRouteAttempt(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) =>
          presenter.presentSchemaError(previousState, error),
        UnauthenticatedGymMemberError: () => redirectToSignIn,
        GymNotFoundError: () =>
          presenter.presentRouteNotFound(previousState),
        GymMembershipRequiredError: () =>
          presenter.presentMembershipRequired(previousState),
        GymRouteNotFoundError: () =>
          presenter.presentRouteNotFound(previousState),
        GymRouteBoulderUnavailableError: () =>
          presenter.presentBoulderUnavailable(previousState),
        NoActiveGymClimbingSessionError: () =>
          presenter.presentNoActiveSession(previousState),
      }),
      Effect.catchDefect(() =>
        presenter.presentUnexpectedError(previousState)
      )
    ),
  }
})
