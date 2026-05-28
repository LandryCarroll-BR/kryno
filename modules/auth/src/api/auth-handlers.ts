import { HttpApiBuilder } from "effect/unstable/httpapi"

import { AuthHttpApi, AuthHttpGroup } from "./auth-group.ts"
import { Auth } from "../auth.ts"

export const buildAuthHttpHandlers = (
  handlers: HttpApiBuilder.Handlers.FromGroup<typeof AuthHttpGroup>
) =>
  handlers
    .handle("reserveGymUserEmail", ({ payload }) =>
      Auth.use((auth) => auth.reserveGymUserEmail(payload))
    )
    .handle("bootstrapFirstSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.bootstrapFirstSystemAdmin(payload))
    )

export const AuthHttpHandlersLive = HttpApiBuilder.group(
  AuthHttpApi,
  "auth",
  buildAuthHttpHandlers
)
