import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import {
  createJoinGymAsMemberAction,
  type JoinGymAsMemberActionDependencies,
  type JoinGymAsMemberInput,
} from "./join-gym-as-member-action"

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const postRequest = (body: Record<string, string>, cookie?: string) =>
  new Request("https://kryno.test/app/join-gym", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookie === undefined ? {} : { Cookie: cookie }),
    },
    body: new URLSearchParams(body),
  })

const createAction = (
  joinGymAsMember: JoinGymAsMemberActionDependencies["joinGymAsMember"]
) =>
  createJoinGymAsMemberAction({
    joinGymAsMember,
    redirectToLogin: () => Response.redirect("https://kryno.test/recorded-login"),
    redirectToApp: (search) =>
      Response.redirect(`https://kryno.test/recorded-app${search}`),
  })

describe("join gym as member action", () => {
  it("redirects unauthenticated users to login with an app return target", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const response = (await action(actionArgs(postRequest({ gymId: "gym-1" })))) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-login"
    )
  })

  it("validates gym ID before calling the API", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(
        postRequest({ gymId: "  " }, "kryno_gym_user_session=gym-user-session-1")
      )
    )) as Response

    expect(calls).toBe(0)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?form=join-gym&error=invalid-gym-id"
    )
  })

  it("uses the web session cookie and redirects successful joins to the app", async () => {
    const calls: JoinGymAsMemberInput[] = []
    const action = createAction((input) => {
      calls.push(input)
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(
        postRequest(
          { gymId: "  gym-1  " },
          "theme=dark; kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toEqual([
      {
        sessionId: "gym-user-session-1",
        gymId: "gym-1",
      },
    ])
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?status=member-joined"
    )
  })

  it("redirects expected join failures back to the app with useful status", async () => {
    const expectedFailures = [
      {
        failure: { _tag: "GymAccessInactive", gymId: "gym-1" },
        location:
          "https://kryno.test/recorded-app?form=join-gym&error=inactive-gym",
      },
      {
        failure: {
          _tag: "GymMemberAffiliationInvalid",
          gymId: "gym-1",
          userId: "gym-user-1",
        },
        location:
          "https://kryno.test/recorded-app?form=join-gym&error=affiliation-conflict",
      },
      {
        failure: {
          _tag: "GymUserSessionInvalid",
          sessionId: "gym-user-session-1",
        },
        location:
          "https://kryno.test/recorded-app?form=join-gym&error=session-invalid",
      },
      {
        failure: { _tag: "GymUserUnverified", userId: "gym-user-1" },
        location:
          "https://kryno.test/recorded-app?form=join-gym&error=unverified",
      },
    ] as const

    for (const expectedFailure of expectedFailures) {
      const action = createAction(() => Effect.fail(expectedFailure.failure))

      const response = (await action(
        actionArgs(
          postRequest(
            { gymId: "gym-1" },
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
            { gymId: "gym-1" },
            "kryno_gym_user_session=gym-user-session-1"
          )
        )
      )
    ).rejects.toMatchObject({ _tag: "UnexpectedFailure" })
  })
})
