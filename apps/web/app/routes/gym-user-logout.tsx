import { redirect } from "react-router"
import { Effect } from "effect"

import type { Route } from "./+types/gym-user-logout"
import {
  readGymUserSessionCookie,
  serializeExpiredGymUserSessionCookie,
} from "../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
  type KrynoApiClientGetter,
} from "../../lib/kryno-api/kryno-api-client"

const isExpectedLogoutFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  error._tag === "GymUserSessionInvalid"

const redirectToLoginWithExpiredSessionCookie = (request: Request) => {
  const headers = new Headers()
  headers.append("Set-Cookie", serializeExpiredGymUserSessionCookie(request))

  return redirect("/login", { headers })
}

export const createGymUserLogoutAction =
  (
    getClient: KrynoApiClientGetter<{
      readonly auth: {
        readonly logoutGymUser: () => KrynoApiEffect
      }
    }>
  ) =>
  async ({ request }: Route.ActionArgs): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLoginWithExpiredSessionCookie(request)
    }

    const client = await getClient({ sessionId })

    try {
      await Effect.runPromise(client.auth.logoutGymUser())
    } catch (error) {
      if (!isExpectedLogoutFailure(error)) {
        throw error
      }
    }

    return redirectToLoginWithExpiredSessionCookie(request)
  }

export const action = createGymUserLogoutAction(getKrynoApiClient)

export const loader = () => redirect("/login")
