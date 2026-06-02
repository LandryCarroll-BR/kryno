import { redirect } from "react-router"
import { Effect } from "effect"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { CreateStaffInvitationViewModel } from "./create-staff-invitation-view-model"

type CreateStaffInvitationApiPayload = Parameters<
  KrynoApiClient["auth"]["createGymStaffInvitation"]
>[0]["payload"]

export interface CreateStaffInvitationInput {
  readonly sessionId: string
  readonly gymId: string
  readonly email: string
}

export interface CreateStaffInvitationActionDependencies {
  readonly createStaffInvitation: (
    input: CreateStaffInvitationInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
  readonly redirectToApp: (search: string) => Response
}

export type CreateStaffInvitationAction = ({
  request,
}: {
  request: Request
}) => Promise<Response>

const appErrorSearch = (error: string) =>
  `?form=create-staff-invitation&error=${encodeURIComponent(error)}`

export const createCreateStaffInvitationAction =
  ({
    createStaffInvitation,
    redirectToLogin,
    redirectToApp,
  }: CreateStaffInvitationActionDependencies) =>
  async ({ request }: { request: Request }): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLogin()
    }

    const ViewModel = CreateStaffInvitationViewModel
    const formData = await request.formData()
    const input: CreateStaffInvitationInput = {
      sessionId,
      gymId: ViewModel.readFormString(formData, "gymId"),
      email: ViewModel.readFormString(formData, "email"),
    }

    const fieldErrors = ViewModel.validate({
      gymId: input.gymId,
      email: input.email,
    })

    if (fieldErrors.gymId !== undefined) {
      return redirectToApp(appErrorSearch(ViewModel.failureMessages.invalidGymId))
    }

    if (fieldErrors.email !== undefined) {
      return redirectToApp(appErrorSearch(ViewModel.failureMessages.invalidEmail))
    }

    const requestEffect = await createStaffInvitation(input)

    return await requestEffect.pipe(
      Effect.andThen(() =>
        Effect.succeed(redirectToApp("?status=staff-invitation-created"))
      ),
      Effect.catchTags({
        GymOwnerAccessDenied: () =>
          Effect.succeed(
            redirectToApp(
              appErrorSearch(ViewModel.failureMessages.ownerAccessDenied)
            )
          ),
        GymAccessInactive: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.inactiveGym))
          ),
        GymStaffSelfAssignmentDenied: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.selfAssignment))
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

export const redirectToLoginForCreateStaffInvitation = () =>
  redirect(`/login?redirectTo=${encodeURIComponent("/app")}`)

export const redirectToAppAfterCreateStaffInvitation = (search: string) =>
  redirect(`/app${search}`)

export const createStaffInvitationAction: CreateStaffInvitationAction =
  createCreateStaffInvitationAction({
    createStaffInvitation: async ({ sessionId, gymId, email }) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.createGymStaffInvitation({
        payload: {
          gymId: gymId as CreateStaffInvitationApiPayload["gymId"],
          email,
        },
      })
    },
    redirectToLogin: redirectToLoginForCreateStaffInvitation,
    redirectToApp: redirectToAppAfterCreateStaffInvitation,
  })
