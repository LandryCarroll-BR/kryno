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
    .handle("loginSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.loginSystemAdmin(payload))
    )
    .handle("currentSystemAdminSession", ({ params }) =>
      Auth.use((auth) => auth.currentSystemAdminSession(params))
    )
    .handle("logoutSystemAdmin", ({ params }) =>
      Auth.use((auth) => auth.logoutSystemAdmin(params))
    )

export const AuthHttpHandlersLive = HttpApiBuilder.group(
  AuthHttpApi,
  "auth",
  buildAuthHttpHandlers
)
