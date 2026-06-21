import { Layer } from "effect"
import { SessionInMemoryRepository } from "../test/repositories/session-in-memory.repository"
import { UserInMemoryRepository } from "../test/repositories/user-in-memory.repository"
import { SessionServiceLive } from "../src/services/session.service"
import { UserServiceLive } from "../src/services/user.service"

export const InfrastructureTextLayer = Layer.mergeAll(
  SessionInMemoryRepository,
  UserInMemoryRepository,
  SessionServiceLive,
  UserServiceLive
)
