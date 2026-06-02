import { Effect } from "effect"
import { redirect } from "react-router"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import {
  AcceptStaffInvitationViewModel,
  type AcceptStaffInvitationActionData,
} from "./accept-staff-invitation-view-model"
import { redirectToLoginForAcceptStaffInvitation } from "./accept-staff-invitation-loader"

type AcceptStaffInvitationApiPayload = Parameters<
  KrynoApiClient["auth"]["acceptGymStaffInvitation"]
>[0]["payload"]

export interface AcceptStaffInvitationInput {
  readonly sessionId: string
  readonly token: string
}

export interface AcceptStaffInvitationActionDependencies {
  readonly acceptStaffInvitation: (
    input: AcceptStaffInvitationInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: (request: Request) => Response
  readonly redirectToApp: (search: string) => Response
}

export type AcceptStaffInvitationAction = ({
  request,
}: {
  request: Request
}) => Promise<Response | AcceptStaffInvitationActionData>

export const createAcceptStaffInvitationAction =
  ({
    acceptStaffInvitation,
    redirectToLogin,
    redirectToApp,
  }: AcceptStaffInvitationActionDependencies) =>
  async ({
    request,
  }: {
    request: Request
  }): Promise<Response | AcceptStaffInvitationActionData> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLogin(request)
    }

    const ViewModel = AcceptStaffInvitationViewModel
    const formData = await request.formData()
    const input: AcceptStaffInvitationInput = {
      sessionId,
      token: ViewModel.readFormString(formData, "token"),
    }

    const fieldErrors = ViewModel.validate({ token: input.token })

    if (Object.keys(fieldErrors).length > 0) {
      return ViewModel.toError(ViewModel.failureMessages.invalidInput, fieldErrors)
    }

    const acceptanceEffect = await acceptStaffInvitation(input)

    return await acceptanceEffect.pipe(
      Effect.andThen(() =>
        Effect.succeed(redirectToApp("?status=staff-invitation-accepted"))
      ),
      Effect.catchTags({
        GymStaffInvitationInvalid: () =>
          Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.invalidToken, {
              token: ViewModel.failureMessages.invalidToken,
            })
          ),
        GymAccessInactive: () =>
          Effect.succeed(ViewModel.toError(ViewModel.failureMessages.inactiveGym)),
        GymStaffSelfAssignmentDenied: () =>
          Effect.succeed(
            ViewModel.toError(ViewModel.failureMessages.selfAssignment)
          ),
        GymUserSessionInvalid: () => Effect.succeed(redirectToLogin(request)),
        GymUserUnverified: () =>
          Effect.succeed(ViewModel.toError(ViewModel.failureMessages.unverified)),
      }),
      Effect.runPromise
    )
  }

export const redirectToAppAfterAcceptStaffInvitation = (search: string) =>
  redirect(`/app${search}`)

export const acceptStaffInvitationAction: AcceptStaffInvitationAction =
  createAcceptStaffInvitationAction({
    acceptStaffInvitation: async ({ sessionId, token }) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.acceptGymStaffInvitation({
        payload: {
          token: token as AcceptStaffInvitationApiPayload["token"],
        },
      })
    },
    redirectToLogin: redirectToLoginForAcceptStaffInvitation,
    redirectToApp: redirectToAppAfterAcceptStaffInvitation,
  })
