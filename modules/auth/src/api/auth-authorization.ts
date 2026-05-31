import { Context, Effect, Layer, Redacted } from "effect"
import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "effect/unstable/httpapi"

import { Auth } from "../auth.ts"
import { GymUserSessionId } from "../domain/gym-user.ts"
import { SystemAdminSessionId } from "../domain/system-admin.ts"

export class CurrentGymUserSessionId extends Context.Service<
  CurrentGymUserSessionId,
  GymUserSessionId
>()("@workspace/auth/CurrentGymUserSessionId") {}

export class CurrentSystemAdminSessionId extends Context.Service<
  CurrentSystemAdminSessionId,
  SystemAdminSessionId
>()("@workspace/auth/CurrentSystemAdminSessionId") {}

export class GymUserSessionRequired extends HttpApiMiddleware.Service<
  GymUserSessionRequired,
  {
    provides: CurrentGymUserSessionId
    requires: Auth
  }
>()("@workspace/auth/GymUserSessionRequired", {
  error: HttpApiError.UnauthorizedNoContent,
  security: {
    bearer: HttpApiSecurity.bearer,
  },
}) {}

export class SystemAdminSessionRequired extends HttpApiMiddleware.Service<
  SystemAdminSessionRequired,
  {
    provides: CurrentSystemAdminSessionId
    requires: Auth
  }
>()("@workspace/auth/SystemAdminSessionRequired", {
  error: HttpApiError.UnauthorizedNoContent,
  security: {
    bearer: HttpApiSecurity.bearer,
  },
}) {}

const bearerSessionId = (credential: Redacted.Redacted<string>) => {
  const sessionId = Redacted.value(credential).trim()

  return sessionId.length === 0
    ? Effect.fail(new HttpApiError.Unauthorized({}))
    : Effect.succeed(sessionId)
}

export const GymUserSessionRequiredLive = Layer.succeed(
  GymUserSessionRequired,
  {
    bearer: (httpEffect, { credential }) =>
      Effect.gen(function* () {
        const sessionId = yield* bearerSessionId(credential)
        const gymUserSessionId = GymUserSessionId.make(sessionId)

        yield* Auth.use((auth) =>
          auth.currentGymUserSession({
            sessionId: gymUserSessionId,
          })
        ).pipe(Effect.mapError(() => new HttpApiError.Unauthorized({})))

        return yield* Effect.provideService(
          httpEffect,
          CurrentGymUserSessionId,
          gymUserSessionId
        )
      }),
  }
)

export const SystemAdminSessionRequiredLive = Layer.succeed(
  SystemAdminSessionRequired,
  {
    bearer: (httpEffect, { credential }) =>
      Effect.gen(function* () {
        const sessionId = yield* bearerSessionId(credential)
        const systemAdminSessionId = SystemAdminSessionId.make(sessionId)

        yield* Auth.use((auth) =>
          auth.currentSystemAdminSession({
            sessionId: systemAdminSessionId,
          })
        ).pipe(Effect.mapError(() => new HttpApiError.Unauthorized({})))

        return yield* Effect.provideService(
          httpEffect,
          CurrentSystemAdminSessionId,
          systemAdminSessionId
        )
      }),
  }
)

export const AuthHttpAuthorizationLive = Layer.mergeAll(
  GymUserSessionRequiredLive,
  SystemAdminSessionRequiredLive
)

export const AuthHttpAuthorization = {
  gymUser: GymUserSessionRequired,
  systemAdmin: SystemAdminSessionRequired,
  layer: AuthHttpAuthorizationLive,
} as const
