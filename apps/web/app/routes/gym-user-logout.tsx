import { redirect } from "react-router"

import type { Route } from "./+types/gym-user-logout"
import {
  readGymUserSessionCookie,
  serializeExpiredGymUserSessionCookie,
} from "../lib/gym-user-session-cookie"
import { getKrynoApiClient, type KrynoApiClient } from "../lib/kryno-api-client"

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
  (getClient: (request: Request) => Promise<KrynoApiClient>) =>
  async ({ request }: Route.ActionArgs): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLoginWithExpiredSessionCookie(request)
    }

    const client = await getClient(request)

    try {
      await client.logoutGymUser(sessionId)
    } catch (error) {
      if (!isExpectedLogoutFailure(error)) {
        throw error
      }
    }

    return redirectToLoginWithExpiredSessionCookie(request)
  }

export const action = createGymUserLogoutAction(getKrynoApiClient)

export const loader = () => redirect("/login")
