import { Layer } from "effect"
import { SessionInMemoryRepository } from "./repositories/session-in-memory.repository"
import { UserInMemoryRepository } from "./repositories/user-in-memory.repository"
import { IdentityServiceLive } from "./services/identity.service"
import { SessionServiceLive } from "./services/session.service"
import { UserServiceLive } from "./services/user.service"

export const InfrastructureLayer = Layer.mergeAll(
  IdentityServiceLive,
  SessionInMemoryRepository,
  SessionServiceLive,
  UserInMemoryRepository,
  UserServiceLive
)
