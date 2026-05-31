import { Effect } from "effect"
import { HttpApiBuilder, HttpApiGroup } from "effect/unstable/httpapi"

import {
  CurrentGymUserSessionId,
  CurrentSystemAdminSessionId,
} from "./auth-authorization.ts"
import { AuthHttpGroup } from "./auth-group.ts"
import { Auth } from "../auth.ts"

export type ApiPrefixedAuthHttpGroup = HttpApiGroup.AddPrefix<
  typeof AuthHttpGroup,
  "/api"
>

export const buildAuthHttpHandlers = (
  handlers: HttpApiBuilder.Handlers.FromGroup<ApiPrefixedAuthHttpGroup>
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
    .handle("currentGymUserSession", () =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.currentGymUserSession({ sessionId }))
        )
      )
    )
    .handle("logoutGymUser", () =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.logoutGymUser({ sessionId }))
        )
      )
    )
    .handle("requestGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.requestGymUserPasswordReset(payload))
    )
    .handle("completeGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.completeGymUserPasswordReset(payload))
    )
    .handle("requestGymCreation", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.requestGymCreation({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("approveGymCreationRequest", ({ payload }) =>
      CurrentSystemAdminSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.approveGymCreationRequest({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("currentGymOwnerAccess", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.currentGymOwnerAccess({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("joinGymAsMember", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.joinGymAsMember({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("leaveGymAsMember", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.leaveGymAsMember({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("createGymStaffInvitation", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.createGymStaffInvitation({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("acceptGymStaffInvitation", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.acceptGymStaffInvitation({
              ...payload,
              sessionId,
            })
          )
        )
      )
    )
    .handle("bootstrapFirstSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.bootstrapFirstSystemAdmin(payload))
    )
    .handle("loginSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.loginSystemAdmin(payload))
    )
    .handle("currentSystemAdminSession", () =>
      CurrentSystemAdminSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.currentSystemAdminSession({ sessionId }))
        )
      )
    )
    .handle("logoutSystemAdmin", () =>
      CurrentSystemAdminSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.logoutSystemAdmin({ sessionId }))
        )
      )
    )
