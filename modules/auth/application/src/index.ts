import { Layer } from "effect"

import { SignInUseCase } from "./use-cases/sign-in.use-case"
import { SignUpUseCase } from "./use-cases/sign-up.use-case"
import { ValidateSessionUseCase } from "./use-cases/validate-session.use-case"
import { SignOutUseCase } from "./use-cases/sign-out.use-case"

export * from "./errors/session.errors"
export * from "./errors/user.errors"

export * from "./models/identity.models"
export * from "./models/session.models"
export * from "./models/user.models"

export * from "./repositories/session.repository"
export * from "./repositories/user.repository"

export * from "./services/identity.service"
export * from "./services/session.service"
export * from "./services/user.service"

export * from "./use-cases/sign-up.use-case"
export * from "./use-cases/sign-in.use-case"
export * from "./use-cases/sign-out.use-case"
export * from "./use-cases/validate-session.use-case"

const SignOutLayer = SignOutUseCase.Live.pipe(
  Layer.provideMerge(ValidateSessionUseCase.Live)
)

export const ApplicationLayer = Layer.mergeAll(
  SignUpUseCase.Live,
  SignInUseCase.Live,
  SignOutLayer
)
