import { Effect, Schema } from "effect"
import { Headers, Navigation } from "@packages/effect-next"
import { SignOutInputSchema } from "@auth/application"
import { Auth } from "@auth/component"

export const SignOutControllerInputSchema = SignOutInputSchema.annotate({
  identifier: "SignOutControllerInput",
})

export const SignOutController = Effect.fn("SignOutController.make")(
  function* ({ redirectUrl }: { redirectUrl: string }) {
    const auth = yield* Auth
    const cookies = yield* Headers.Cookies

    const handleDelete = Effect.gen(function* () {
      cookies.delete({ name: "authToken", path: "/" })
      return yield* Navigation.Redirect(redirectUrl)
    })

    return {
      handle: Effect.fn("SignOutController.handle")(
        function* () {
          const authToken = cookies.get("authToken")

          if (authToken?.value) {
            yield* Schema.decodeUnknownEffect(SignOutControllerInputSchema)({
              token: authToken.value,
            }).pipe(Effect.flatMap((input) => auth.signOut(input)))
          }

          return yield* handleDelete
        },
        Effect.catch(() => handleDelete)
      ),
    }
  }
)
