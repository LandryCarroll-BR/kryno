import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import {
  createCreateStaffInvitationAction,
  type CreateStaffInvitationActionDependencies,
  type CreateStaffInvitationInput,
} from "./create-staff-invitation-action"

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const postRequest = (body: Record<string, string>, cookie?: string) =>
  new Request("https://kryno.test/app/create-staff-invitation", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookie === undefined ? {} : { Cookie: cookie }),
    },
    body: new URLSearchParams(body),
  })

const createAction = (
  createStaffInvitation: CreateStaffInvitationActionDependencies["createStaffInvitation"]
) =>
  createCreateStaffInvitationAction({
    createStaffInvitation,
    redirectToLogin: () => Response.redirect("https://kryno.test/recorded-login"),
    redirectToApp: (search) =>
      Response.redirect(`https://kryno.test/recorded-app${search}`),
  })

describe("create staff invitation action", () => {
  it("redirects unauthenticated users to login with an app return target", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(postRequest({ gymId: "gym-1", email: "staff@test.dev" }))
    )) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-login"
    )
  })

  it("validates gym ID and email before calling the API", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const missingGymResponse = (await action(
      actionArgs(
        postRequest(
          { gymId: "  ", email: "staff@test.dev" },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response
    const invalidEmailResponse = (await action(
      actionArgs(
        postRequest(
          { gymId: "gym-1", email: "not-an-email" },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toBe(0)
    expect(missingGymResponse.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?form=create-staff-invitation&error=invalid-gym-id"
    )
    expect(invalidEmailResponse.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?form=create-staff-invitation&error=invalid-email"
    )
  })

  it("uses the web session cookie and redirects successful invitations to the app", async () => {
    const calls: CreateStaffInvitationInput[] = []
    const action = createAction((input) => {
      calls.push(input)
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(
        postRequest(
          { gymId: "  gym-1  ", email: "  staff@test.dev  " },
          "theme=dark; kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toEqual([
      {
        sessionId: "gym-user-session-1",
        gymId: "gym-1",
        email: "staff@test.dev",
      },
    ])
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?status=staff-invitation-created"
    )
  })

  it("redirects expected invitation failures back to the app with useful status", async () => {
    const expectedFailures = [
      {
        failure: {
          _tag: "GymOwnerAccessDenied",
          gymId: "gym-1",
          userId: "gym-user-1",
        },
        location:
          "https://kryno.test/recorded-app?form=create-staff-invitation&error=owner-access-denied",
      },
      {
        failure: { _tag: "GymAccessInactive", gymId: "gym-1" },
        location:
          "https://kryno.test/recorded-app?form=create-staff-invitation&error=inactive-gym",
      },
      {
        failure: {
          _tag: "GymStaffSelfAssignmentDenied",
          gymId: "gym-1",
          userId: "gym-user-1",
        },
        location:
          "https://kryno.test/recorded-app?form=create-staff-invitation&error=self-assignment",
      },
      {
        failure: {
          _tag: "GymUserSessionInvalid",
          sessionId: "gym-user-session-1",
        },
        location:
          "https://kryno.test/recorded-app?form=create-staff-invitation&error=session-invalid",
      },
      {
        failure: { _tag: "GymUserUnverified", userId: "gym-user-1" },
        location:
          "https://kryno.test/recorded-app?form=create-staff-invitation&error=unverified",
      },
    ] as const

    for (const expectedFailure of expectedFailures) {
      const action = createAction(() => Effect.fail(expectedFailure.failure))

      const response = (await action(
        actionArgs(
          postRequest(
            { gymId: "gym-1", email: "staff@test.dev" },
            "kryno_gym_user_session=gym-user-session-1"
          )
        )
      )) as Response

      expect(response.headers.get("Location")).toBe(expectedFailure.location)
    }
  })

  it("does not swallow unexpected failures", async () => {
    const action = createAction(() =>
      Effect.fail({
        _tag: "UnexpectedFailure",
      })
    )

    await expect(
      action(
        actionArgs(
          postRequest(
            { gymId: "gym-1", email: "staff@test.dev" },
            "kryno_gym_user_session=gym-user-session-1"
          )
        )
      )
    ).rejects.toMatchObject({ _tag: "UnexpectedFailure" })
  })
})
