import { redirect } from "react-router"
import { Effect } from "effect"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { JoinGymAsMemberViewModel } from "./join-gym-as-member-view-model"

type JoinGymAsMemberApiPayload = Parameters<
  KrynoApiClient["auth"]["joinGymAsMember"]
>[0]["payload"]

export interface JoinGymAsMemberInput {
  readonly sessionId: string
  readonly gymId: string
}

export interface JoinGymAsMemberActionDependencies {
  readonly joinGymAsMember: (
    input: JoinGymAsMemberInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
  readonly redirectToApp: (search: string) => Response
}

export type JoinGymAsMemberAction = ({
  request,
}: {
  request: Request
}) => Promise<Response>

const appErrorSearch = (error: string) =>
  `?form=join-gym&error=${encodeURIComponent(error)}`

export const createJoinGymAsMemberAction =
  ({
    joinGymAsMember,
    redirectToLogin,
    redirectToApp,
  }: JoinGymAsMemberActionDependencies) =>
  async ({ request }: { request: Request }): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLogin()
    }

    const ViewModel = JoinGymAsMemberViewModel
    const formData = await request.formData()
    const input: JoinGymAsMemberInput = {
      sessionId,
      gymId: ViewModel.readFormString(formData, "gymId"),
    }

    const fieldErrors = ViewModel.validate({ gymId: input.gymId })

    if (fieldErrors.gymId !== undefined) {
      return redirectToApp(appErrorSearch(ViewModel.failureMessages.invalidGymId))
    }

    const requestEffect = await joinGymAsMember(input)

    return await requestEffect.pipe(
      Effect.andThen(() => Effect.succeed(redirectToApp("?status=member-joined"))),
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

export const redirectToLoginForJoinGymAsMember = () =>
  redirect(`/login?redirectTo=${encodeURIComponent("/app")}`)

export const redirectToAppAfterJoinGymAsMember = (search: string) =>
  redirect(`/app${search}`)

export const joinGymAsMemberAction: JoinGymAsMemberAction =
  createJoinGymAsMemberAction({
    joinGymAsMember: async ({ sessionId, gymId }) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.joinGymAsMember({
        payload: { gymId: gymId as JoinGymAsMemberApiPayload["gymId"] },
      })
    },
    redirectToLogin: redirectToLoginForJoinGymAsMember,
    redirectToApp: redirectToAppAfterJoinGymAsMember,
  })
