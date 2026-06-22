import { Effect, Option, Schema } from "effect"
import { GetCurrentUserInputSchema } from "@auth/application"
import { Auth } from "@auth/component"
import { Headers } from "@packages/effect-next"

export const GetCurrentUserControllerInputSchema =
  GetCurrentUserInputSchema.annotate({
    identifier: "GetCurrentUserControllerInput",
  })

export const GetCurrentUserController = Effect.fn(
  "GetCurrentUserController.make"
)(function* () {
  const auth = yield* Auth
  const cookies = yield* Headers.Cookies

  return {
    handle: Effect.fn("GetCurrentUserController.handle")(
      function* () {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return Option.none()
        }

        const parsedInput = yield* Schema.decodeUnknownEffect(
          GetCurrentUserControllerInputSchema
        )({ token: authToken.value })

        return yield* auth.getCurrentUser(parsedInput)
      },
      Effect.catchTag("SchemaError", () => Effect.succeed(Option.none()))
    ),
  }
})
