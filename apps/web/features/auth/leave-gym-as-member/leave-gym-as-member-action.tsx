import { redirect } from "react-router"
import { Effect } from "effect"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { LeaveGymAsMemberViewModel } from "./leave-gym-as-member-view-model"

type LeaveGymAsMemberApiPayload = Parameters<
  KrynoApiClient["auth"]["leaveGymAsMember"]
>[0]["payload"]

export interface LeaveGymAsMemberInput {
  readonly sessionId: string
  readonly gymId: string
}

export interface LeaveGymAsMemberActionDependencies {
  readonly leaveGymAsMember: (
    input: LeaveGymAsMemberInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
  readonly redirectToApp: (search: string) => Response
}

export type LeaveGymAsMemberAction = ({
  request,
}: {
  request: Request
}) => Promise<Response>

const appErrorSearch = (error: string) =>
  `?form=leave-gym&error=${encodeURIComponent(error)}`

export const createLeaveGymAsMemberAction =
  ({
    leaveGymAsMember,
    redirectToLogin,
    redirectToApp,
  }: LeaveGymAsMemberActionDependencies) =>
  async ({ request }: { request: Request }): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLogin()
    }

    const ViewModel = LeaveGymAsMemberViewModel
    const formData = await request.formData()
    const input: LeaveGymAsMemberInput = {
      sessionId,
      gymId: ViewModel.readFormString(formData, "gymId"),
    }

    const fieldErrors = ViewModel.validate({ gymId: input.gymId })

    if (fieldErrors.gymId !== undefined) {
      return redirectToApp(appErrorSearch(ViewModel.failureMessages.invalidGymId))
    }

    const requestEffect = await leaveGymAsMember(input)

    return await requestEffect.pipe(
      Effect.andThen(() => Effect.succeed(redirectToApp("?status=member-left"))),
      Effect.catchTags({
        GymAccessInactive: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.inactiveGym))
          ),
        GymMemberAffiliationInvalid: () =>
          Effect.succeed(
            redirectToApp(
              appErrorSearch(ViewModel.failureMessages.affiliationConflict)
            )
          ),
        GymUserSessionInvalid: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.sessionInvalid))
          ),
        GymUserUnverified: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.unverified))
          ),
      }),
      Effect.runPromise
    )
  }

export const redirectToLoginForLeaveGymAsMember = () =>
  redirect(`/login?redirectTo=${encodeURIComponent("/app")}`)

export const redirectToAppAfterLeaveGymAsMember = (search: string) =>
  redirect(`/app${search}`)

export const leaveGymAsMemberAction: LeaveGymAsMemberAction =
  createLeaveGymAsMemberAction({
    leaveGymAsMember: async ({ sessionId, gymId }) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.leaveGymAsMember({
        payload: { gymId: gymId as LeaveGymAsMemberApiPayload["gymId"] },
      })
    },
    redirectToLogin: redirectToLoginForLeaveGymAsMember,
    redirectToApp: redirectToAppAfterLeaveGymAsMember,
  })
