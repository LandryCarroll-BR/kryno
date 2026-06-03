import { Effect } from "effect"
import {
  HttpApiBuilder,
  HttpApiError,
  HttpApiGroup,
} from "effect/unstable/httpapi"
import type { PersistenceError } from "@workspace/drizzle"

import {
  CurrentGymUserSessionId,
  CurrentSystemAdminSessionId,
} from "./auth-authorization.ts"
import { AuthHttpGroup } from "./auth-group.ts"
import { persistenceFailureInternalServerError } from "./persistence-error-response.ts"
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
      Auth.use((auth) => auth.reserveGymUserEmail(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("signUpGymUser", ({ payload }) =>
      Auth.use((auth) => auth.signUpGymUser(payload)).pipe(mapPersistenceError)
    )
    .handle("verifyGymUserEmail", ({ payload }) =>
      Auth.use((auth) => auth.verifyGymUserEmail(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("loginGymUser", ({ payload }) =>
      Auth.use((auth) => auth.loginGymUser(payload)).pipe(mapPersistenceError)
    )
    .handle("currentGymUserSession", () =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.currentGymUserSession({ sessionId }))
            .pipe(mapPersistenceError)
        )
      )
    )
    .handle("logoutGymUser", () =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.logoutGymUser({ sessionId }))
            .pipe(mapPersistenceError)
        )
      )
    )
    .handle("requestGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.requestGymUserPasswordReset(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("completeGymUserPasswordReset", ({ payload }) =>
      Auth.use((auth) => auth.completeGymUserPasswordReset(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("requestGymCreation", ({ payload }) =>
      CurrentGymUserSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) =>
            auth.requestGymCreation({
              ...payload,
              sessionId,
            })
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
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
          ).pipe(mapPersistenceError)
        )
      )
    )
    .handle("bootstrapFirstSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.bootstrapFirstSystemAdmin(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("loginSystemAdmin", ({ payload }) =>
      Auth.use((auth) => auth.loginSystemAdmin(payload)).pipe(
        mapPersistenceError
      )
    )
    .handle("currentSystemAdminSession", () =>
      CurrentSystemAdminSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.currentSystemAdminSession({ sessionId }))
            .pipe(mapPersistenceError)
        )
      )
    )
    .handle("logoutSystemAdmin", () =>
      CurrentSystemAdminSessionId.pipe(
        Effect.flatMap((sessionId) =>
          Auth.use((auth) => auth.logoutSystemAdmin({ sessionId }))
            .pipe(mapPersistenceError)
        )
      )
    )

const mapPersistenceError = <
  A,
  E extends { readonly _tag: string },
  R,
>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<
  A,
  Exclude<E, PersistenceError> | HttpApiError.InternalServerError,
  R
> =>
  effect.pipe(
    Effect.catch(
      (
        error
      ): Effect.Effect<
        never,
        Exclude<E, PersistenceError> | HttpApiError.InternalServerError
      > =>
        error._tag === "PersistenceError"
          ? Effect.fail(persistenceFailureInternalServerError())
          : Effect.fail(error as Exclude<E, PersistenceError>)
    )
  )
