import {
  SignUpInputBoundary,
  SignUpOutputBoundary,
  type SignUpInput,
} from "@auth/application"
import { Effect } from "effect"

export const SignUpHttpController = Effect.gen(function* () {
  const signUpInteractor = yield* SignUpInputBoundary
  const signUpPresenter = yield* SignUpOutputBoundary

  return {
    handle: Effect.fn("SignUpController")(function* (request: SignUpInput) {
      const result = yield* signUpInteractor.execute(request)
      return yield* signUpPresenter.present(result)
    }),
  }
})
