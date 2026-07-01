import { Effect, Schema } from "effect"
import { GetGymManagementInputSchema } from "@gym/application/use-cases/get-gym-management"
import { Gym } from "@gym/component"
import { Headers, Navigation } from "@packages/effect-next"

import { GetGymManagementPresenter } from "../presenters/get-gym-management.presenter"

export const GetGymManagementController = Effect.fn(
  "GetGymManagementController.make"
)(function* ({
  gymId,
  redirectUrl,
  unauthorizedRedirectUrl,
}: {
  gymId: string
  redirectUrl: string
  unauthorizedRedirectUrl: string
}) {
  const gym = yield* Gym
  const cookies = yield* Headers.Cookies
  const presenter = yield* GetGymManagementPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)
  const redirectUnauthorized = Navigation.Redirect(unauthorizedRedirectUrl)

  return {
    handle: Effect.fn("GetGymManagementController.handle")(
      function* () {
        const authToken = cookies.get("authToken")
        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* Schema.decodeUnknownEffect(
          GetGymManagementInputSchema
        )(
          { token: authToken.value, gymId },
          { errors: "all" }
        )
        const success = yield* gym.getGymManagement(input)
        return yield* presenter.presentSuccess(success)
      },
      Effect.catchTags({
        SchemaError: (error) => presenter.presentSchemaError(error),
        UnauthenticatedGymAdministratorError: () => redirectToSignIn,
        UnauthorizedGymAdministratorError: () => redirectUnauthorized,
        GymNotFoundError: () => Navigation.NotFound,
      }),
      Effect.catchDefect(() => presenter.presentUnexpectedError())
    ),
  }
})
