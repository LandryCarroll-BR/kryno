import { Effect, Schema } from "effect"
import { SignOutInputSchema } from "@auth/application"
import { Auth } from "@auth/component"
import { Headers, Navigation } from "@packages/effect-next"

export const SignOutControllerInputSchema = SignOutInputSchema.annotate({
  identifier: "SignOutControllerInput",
})

export const SignOutController = Effect.fn("SignOutController.make")(
  function* () {
    const auth = yield* Auth
    const cookies = yield* Headers.Cookies

    return {
      handle: Effect.fn("SignOutController.handle")(
        function* ({ redirectUrl }: { redirectUrl: string }) {
          const authToken = cookies.get("authToken")

          if (authToken?.value) {
            yield* Schema.decodeUnknownEffect(SignOutControllerInputSchema)({
              token: authToken.value,
            }).pipe(Effect.flatMap((input) => auth.signOut(input)))
          }

          cookies.delete({ name: "authToken", path: "/" })
          return yield* Navigation.Redirect(redirectUrl)
        },
        Effect.catchTag("SchemaError", () => Effect.void),
        Effect.catchCause((cause) =>
          Effect.logError("Failed to revoke session during sign-out", cause)
        )
      ),
    }
  }
)
