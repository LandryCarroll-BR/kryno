import { Layer } from "effect"

import { SignInUseCase } from "./use-cases/sign-in.use-case"
import { SignUpUseCase } from "./use-cases/sign-up.use-case"
import { ValidateSessionUseCase } from "./use-cases/validate-session.use-case"
import { SignOutUseCase } from "./use-cases/sign-out.use-case"
import { GetCurrentUserUseCase } from "./use-cases/get-current-user.use-case"

export const ApplicationLayer = Layer.mergeAll(
  SignUpUseCase.Live,
  SignInUseCase.Live,
  SignOutUseCase.Live,
  ValidateSessionUseCase.Live,
  GetCurrentUserUseCase.Live
)
