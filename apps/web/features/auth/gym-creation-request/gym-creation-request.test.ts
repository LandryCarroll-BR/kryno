import { describe, expect, it } from "vitest"
import { Effect } from "effect"

import {
  createGymCreationRequestAction,
  type GymCreationRequestActionDependencies,
  type GymCreationRequestInput,
} from "./gym-creation-request-action"

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const postRequest = (body: Record<string, string>, cookie?: string) =>
  new Request("https://kryno.test/app/gym-creation-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookie === undefined ? {} : { Cookie: cookie }),
    },
    body: new URLSearchParams(body),
  })

const createAction = (
  requestGymCreation: GymCreationRequestActionDependencies["requestGymCreation"]
) =>
  createGymCreationRequestAction({
    requestGymCreation,
    redirectToLogin: () => Response.redirect("https://kryno.test/recorded-login"),
    redirectToApp: (search) =>
      Response.redirect(`https://kryno.test/recorded-app${search}`),
  })

describe("gym creation request action", () => {
  it("redirects unauthenticated users to login with an app return target", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(postRequest({ name: "Boulder Yard" }))
    )) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-login"
    )
  })

  it("validates gym name before calling the API", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(
        postRequest(
          { name: "  " },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toBe(0)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?form=gym-creation-request&error=invalid-name"
    )
  })

  it("uses the web session cookie and redirects successful requests to pending approval", async () => {
    const calls: GymCreationRequestInput[] = []
    const action = createAction((input) => {
      calls.push(input)
      return Effect.succeed({})
    })

    const response = (await action(
      actionArgs(
        postRequest(
          { name: "  Boulder Yard  " },
          "theme=dark; kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toEqual([
      {
        sessionId: "gym-user-session-1",
        name: "Boulder Yard",
      },
    ])
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?status=pending-approval"
    )
  })

  it("redirects expected session failures back to the app with useful status", async () => {
    const action = createAction(() =>
      Effect.fail({
        _tag: "GymUserUnverified",
        userId: "gym-user-1",
      })
    )

    const response = (await action(
      actionArgs(
        postRequest(
          { name: "Boulder Yard" },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?form=gym-creation-request&error=unverified"
    )
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
            { name: "Boulder Yard" },
            "kryno_gym_user_session=gym-user-session-1"
          )
        )
      )
    ).rejects.toMatchObject({ _tag: "UnexpectedFailure" })
  })
})
