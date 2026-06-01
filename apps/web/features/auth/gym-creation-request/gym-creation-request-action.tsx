import { redirect } from "react-router"
import { Effect } from "effect"

import { readGymUserSessionCookie } from "../../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
} from "../../../lib/kryno-api/kryno-api-client"
import { GymCreationRequestViewModel } from "./gym-creation-request-view-model"

export interface GymCreationRequestInput {
  readonly sessionId: string
  readonly name: string
}

export interface GymCreationRequestActionDependencies {
  readonly requestGymCreation: (
    input: GymCreationRequestInput
  ) => Promise<KrynoApiEffect> | KrynoApiEffect
  readonly redirectToLogin: () => Response
  readonly redirectToApp: (search: string) => Response
}

export type GymCreationRequestAction = ({
  request,
}: {
  request: Request
}) => Promise<Response>

const appErrorSearch = (error: string) =>
  `?form=gym-creation-request&error=${encodeURIComponent(error)}`

export const createGymCreationRequestAction =
  ({
    requestGymCreation,
    redirectToLogin,
    redirectToApp,
  }: GymCreationRequestActionDependencies) =>
  async ({ request }: { request: Request }): Promise<Response> => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirectToLogin()
    }

    const ViewModel = GymCreationRequestViewModel
    const formData = await request.formData()
    const input: GymCreationRequestInput = {
      sessionId,
      name: ViewModel.readFormString(formData, "name"),
    }

    const fieldErrors = ViewModel.validate({ name: input.name })

    if (fieldErrors.name !== undefined) {
      return redirectToApp(appErrorSearch(ViewModel.failureMessages.invalidName))
    }

    const requestEffect = await requestGymCreation(input)

    return await requestEffect.pipe(
      Effect.andThen(() =>
        Effect.succeed(redirectToApp("?status=pending-approval"))
      ),
      Effect.catchTags({
        GymUserSessionInvalid: () =>
          Effect.succeed(
            redirectToApp(
              appErrorSearch(ViewModel.failureMessages.sessionInvalid)
            )
          ),
        GymUserUnverified: () =>
          Effect.succeed(
            redirectToApp(appErrorSearch(ViewModel.failureMessages.unverified))
          ),
      }),
      Effect.runPromise
    )
  }

export const redirectToLoginForGymCreationRequest = () =>
  redirect(`/login?redirectTo=${encodeURIComponent("/app")}`)

export const redirectToAppAfterGymCreationRequest = (search: string) =>
  redirect(`/app${search}`)

export const gymCreationRequestAction: GymCreationRequestAction =
  createGymCreationRequestAction({
    requestGymCreation: async ({ sessionId, name }) => {
      const client = await getKrynoApiClient({ sessionId })
      return client.auth.requestGymCreation({ payload: { name } })
    },
    redirectToLogin: redirectToLoginForGymCreationRequest,
    redirectToApp: redirectToAppAfterGymCreationRequest,
  })
