import { Layer } from "effect"
import { IdentityServiceLive } from "./services/identity.service"
import { SessionServiceLive } from "./services/session.service"
import { UserServiceLive } from "./services/user.service"

export const InfrastructureLayer = Layer.mergeAll(
  IdentityServiceLive,
  SessionServiceLive,
  UserServiceLive
)
