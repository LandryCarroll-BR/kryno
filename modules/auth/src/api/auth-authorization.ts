import { Effect, Layer, Redacted } from "effect"
import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "effect/unstable/httpapi"

import { Auth } from "../auth.ts"
import { SystemAdminSessionId } from "../domain/system-admin.ts"
import { GymUserSessionId } from "../domain/gym-user.ts"

export class AuthSessionTransportRequired extends HttpApiMiddleware.Service<
  AuthSessionTransportRequired,
  {
    requires: Auth
  }
>()("@workspace/auth/AuthSessionTransportRequired", {
  error: HttpApiError.UnauthorizedNoContent,
  security: {
    bearer: HttpApiSecurity.bearer,
  },
}) {}

export const AuthSessionTransportRequiredLive = Layer.succeed(
  AuthSessionTransportRequired,
  {
    bearer: (httpEffect, { credential, endpoint }) => {
      const sessionId = Redacted.value(credential).trim()

      if (sessionId.length === 0) {
        return Effect.fail(new HttpApiError.Unauthorized({}))
      }

      const validateSession: Effect.Effect<unknown, unknown, Auth> =
        endpoint.name === "approveGymCreationRequest" ||
        endpoint.name === "currentSystemAdminSession" ||
        endpoint.name === "logoutSystemAdmin"
          ? Auth.use((auth) =>
              auth.currentSystemAdminSession({
                sessionId: SystemAdminSessionId.make(sessionId),
              })
            )
          : Auth.use((auth) =>
              auth.currentGymUserSession({
                sessionId: GymUserSessionId.make(sessionId),
              })
            )

      return validateSession.pipe(
        Effect.mapError(() => new HttpApiError.Unauthorized({})),
        Effect.andThen(httpEffect)
      )
    },
  }
)
