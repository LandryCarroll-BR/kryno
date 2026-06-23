import { Effect, Option, Schema } from "effect"
import { GetCurrentUserInputSchema } from "@auth/application"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"

export const GetCurrentUserControllerInputSchema =
  GetCurrentUserInputSchema.annotate({
    identifier: "GetCurrentUserControllerInput",
  })

export const GetCurrentUserController = Effect.fn(
  "GetCurrentUserController.make"
)(function* ({ redirectUrl }: { redirectUrl: string }) {
  const auth = yield* Auth
  const cookies = yield* Headers.Cookies

  const handleNoUser = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("GetCurrentUserController.handle")(
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* handleNoUser
        }

        const parsedInput = yield* Schema.decodeUnknownEffect(
          GetCurrentUserControllerInputSchema
        )({ token: authToken.value })

        const currentUser = yield* auth.getCurrentUser(parsedInput)

        if (Option.isNone(currentUser)) {
          return yield* handleNoUser
        }

        return currentUser.value
      },
      Effect.catch(() => handleNoUser)
    ),
  }
})
