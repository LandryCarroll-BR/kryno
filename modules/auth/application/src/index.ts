import { Layer } from "effect"

import { SignInUseCase } from "./use-cases/sign-in.use-case"
import { SignUpUseCase } from "./use-cases/sign-up.use-case"
import { ValidateSessionUseCase } from "./use-cases/validate-session.use-case"
import { SignOutUseCase } from "./use-cases/sign-out.use-case"
import { GetCurrentUserUseCase } from "./use-cases/get-current-user.use-case"

export * from "./errors/session.errors"
export * from "./errors/user.errors"

export * from "./models/session.models"
export * from "./models/user.models"

export * from "./repositories/session.repository"
export * from "./repositories/user.repository"

export * from "./services/session.service"
export * from "./services/user.service"

export * from "./use-cases/sign-up.use-case"
export * from "./use-cases/sign-in.use-case"
export * from "./use-cases/sign-out.use-case"
export * from "./use-cases/validate-session.use-case"
export * from "./use-cases/get-current-user.use-case"

export const ApplicationLayer = Layer.mergeAll(
  SignUpUseCase.Live,
  SignInUseCase.Live,
  SignOutUseCase.Live,
  ValidateSessionUseCase.Live,
  GetCurrentUserUseCase.Live
)
