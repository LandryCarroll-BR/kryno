import { Effect, Layer } from "effect"
import { Service } from "effect/Context"

export type SignOutViewModel = {
  success: "success" | "error"
  message: string
}

export class SignOutPresenter extends Service<
  SignOutPresenter,
  {
    readonly presentSuccess: () => Effect.Effect<SignOutViewModel>
    readonly presentError: () => Effect.Effect<SignOutViewModel>
  }
>()("@auth/adapters/next/SignOutPresenter") {
  static Live = Layer.effect(
    SignOutPresenter,
    Effect.gen(function* () {
      return {
        presentSuccess: () =>
          Effect.succeed({
            success: "success",
            message: "You have been signed out successfully.",
          }),

        presentError: () =>
          Effect.succeed({
            success: "error",
            message: "An error occurred while signing out. Please try again.",
          }),
      }
    })
  )
}
