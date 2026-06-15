import { SignInInputBoundary } from "@/use-cases/sign-up/sign-up.input-boundary"
import { UserRepository } from "@/user/user.repositories"
import { Effect, Layer, Option } from "effect"

export const SignInInteractor = Layer.effect(
  SignInInputBoundary,
  Effect.gen(function* () {
    const signInOutputBoundary = yield* SignInInputBoundary
    const userRepository = yield* UserRepository

    return {
      execute: Effect.fn(
        "@workspace/auth/application/use-cases/sign-in-interactor/execute"
      )(function* (input) {
        const existingUser = yield* userRepository.findByUsername(
          input.username
        )
        if (Option.some(existingUser)) {
          // Handle the case where the user already exists
        }
      }),
    }
  })
)
