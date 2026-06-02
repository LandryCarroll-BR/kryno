import { redirect } from "react-router"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"

const invitationReturnTarget = (request: Request) => {
  const url = new URL(request.url)
  return `${url.pathname}${url.search}`
}

export const redirectToLoginForAcceptStaffInvitation = (
  request: Request,
  origin = ""
) =>
  redirect(
    `${origin}/login?redirectTo=${encodeURIComponent(
      invitationReturnTarget(request)
    )}`
  )

export const acceptStaffInvitationLoader = ({
  request,
}: {
  request: Request
}) => {
  const sessionId = readGymUserSessionCookie(request)

  if (sessionId === undefined) {
    return redirectToLoginForAcceptStaffInvitation(request)
  }

  return null
}
