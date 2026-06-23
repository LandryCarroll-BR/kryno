import { Layer } from "effect"
import { SessionServiceLive } from "./services/session.service"
import { UserServiceLive } from "./services/user.service"
import { UserDBRepository } from "./repositories/user-db.repository"
import { SessionDBRepository } from "./repositories/session-db.repository"
import { AuthDBContextLive } from "./db/context"

export const InfrastructureLayer = Layer.mergeAll(
  SessionServiceLive,
  UserServiceLive,
  UserDBRepository,
  SessionDBRepository
).pipe(Layer.provide(AuthDBContextLive))
