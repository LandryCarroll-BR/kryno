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
    .handle("signUpGymUser", ({ payload }) =>
      Auth.use((auth) => auth.signUpGymUser(payload))
    )
    .handle("verifyGymUserEmail", ({ payload }) =>
      Auth.use((auth) => auth.verifyGymUserEmail(payload))
    )
    .handle("loginGymUser", ({ payload }) =>
      Auth.use((auth) => auth.loginGymUser(payload))
    )
    .handle("currentGymUserSession", ({ params }) =>
      Auth.use((auth) => auth.currentGymUserSession(params))
    )
    .handle("logoutGymUser", ({ params }) =>
      Auth.use((auth) => auth.logoutGymUser(params))
    )
    .handle("requestGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.requestGymUserPasswordReset(payload))
    )
    .handle("completeGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.completeGymUserPasswordReset(payload))
    )
    .handle("requestGymCreation", ({ payload }) =>
      Auth.use((auth) => auth.requestGymCreation(payload))
    )
    .handle("approveGymCreationRequest", ({ payload }) =>
      Auth.use((auth) => auth.approveGymCreationRequest(payload))
    )
    .handle("currentGymOwnerAccess", ({ payload }) =>
      Auth.use((auth) => auth.currentGymOwnerAccess(payload))
    )
    .handle("joinGymAsMember", ({ payload }) =>
      Auth.use((auth) => auth.joinGymAsMember(payload))
    )
    .handle("leaveGymAsMember", ({ payload }) =>
      Auth.use((auth) => auth.leaveGymAsMember(payload))
    )
    .handle("createGymStaffInvitation", ({ payload }) =>
      Auth.use((auth) => auth.createGymStaffInvitation(payload))
    )
    .handle("acceptGymStaffInvitation", ({ payload }) =>
      Auth.use((auth) => auth.acceptGymStaffInvitation(payload))
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
