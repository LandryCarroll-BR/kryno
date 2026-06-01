import { redirect } from "react-router"
import { Effect } from "effect"

import {
  readGymUserSessionCookie,
  serializeExpiredGymUserSessionCookie,
} from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"

export interface GymUserLogoutActionDependencies {
  readonly logoutGymUser: (
    sessionId: string
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLoginWithExpiredSessionCookie: (
    request: Request
  ) => Response
}

export type GymUserLogoutAction = ({
  request,
}: {
  request: Request
}) => Promise<Response>

export const createGymUserLogoutAction =
  ({
    logoutGymUser,
    redirectToLoginWithExpiredSessionCookie,
  }: GymUserLogoutActionDependencies) =>
  async ({ request }: { request: Request }): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLoginWithExpiredSessionCookie(request)
    }

    const logoutEffect = await logoutGymUser(sessionId)

    await logoutEffect.pipe(
      Effect.catchTags({
        GymUserSessionInvalid: () => Effect.void,
      }),
      Effect.runPromise
    )

    return redirectToLoginWithExpiredSessionCookie(request)
  }

export const redirectToLoginWithExpiredSessionCookie = (request: Request) => {
  const headers = new Headers()
  headers.append("Set-Cookie", serializeExpiredGymUserSessionCookie(request))

  return redirect("/login", { headers })
}

export const gymUserLogoutAction: GymUserLogoutAction =
  createGymUserLogoutAction({
    logoutGymUser: async (sessionId) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.logoutGymUser()
    },
    redirectToLoginWithExpiredSessionCookie,
  })
