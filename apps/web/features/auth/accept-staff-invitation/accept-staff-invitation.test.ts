import { Effect } from "effect"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  createAcceptStaffInvitationAction,
  type AcceptStaffInvitationActionDependencies,
  type AcceptStaffInvitationInput,
} from "./accept-staff-invitation-action"
import {
  acceptStaffInvitationLoader,
  redirectToLoginForAcceptStaffInvitation,
} from "./accept-staff-invitation-loader"
import { AcceptStaffInvitationForm } from "./accept-staff-invitation-form"
import {
  AcceptStaffInvitationViewModel,
  type AcceptStaffInvitationActionData,
} from "./accept-staff-invitation-view-model"

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
  }) as never

const postRequest = (body: Record<string, string>, cookie?: string) =>
  new Request(
    "https://kryno.test/app/staff-invitations/accept?token=url-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(cookie === undefined ? {} : { Cookie: cookie }),
      },
      body: new URLSearchParams(body),
    }
  )

const createAction = (
  acceptStaffInvitation: AcceptStaffInvitationActionDependencies["acceptStaffInvitation"]
) =>
  createAcceptStaffInvitationAction({
    acceptStaffInvitation,
    redirectToLogin: (request) =>
      redirectToLoginForAcceptStaffInvitation(request, "https://kryno.test"),
    redirectToApp: (search) =>
      Response.redirect(`https://kryno.test/recorded-app${search}`),
  })

describe("accept staff invitation loader", () => {
  it("redirects visitors to login with the full invitation URL preserved", () => {
    const response = acceptStaffInvitationLoader(
      actionArgs(
        new Request(
          "https://kryno.test/app/staff-invitations/accept?token=staff-token-1"
        )
      )
    ) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "/login?redirectTo=%2Fapp%2Fstaff-invitations%2Faccept%3Ftoken%3Dstaff-token-1"
    )
  })

  it("allows visitors with a web session cookie to view the confirmation page", () => {
    const result = acceptStaffInvitationLoader(
      actionArgs(
        new Request(
          "https://kryno.test/app/staff-invitations/accept?token=staff-token-1",
          {
            headers: {
              Cookie: "kryno_gym_user_session=gym-user-session-1",
            },
          }
        )
      )
    )

    expect(result).toBeNull()
  })
})

describe("accept staff invitation view model", () => {
  it("prefills the editable token from query params", () => {
    expect(
      AcceptStaffInvitationViewModel.initialToken(
        new URL(
          "https://kryno.test/app/staff-invitations/accept?token= staff-token-1 "
        )
      )
    ).toBe("staff-token-1")
  })

  it("validates token input", () => {
    expect(AcceptStaffInvitationViewModel.validate({ token: "" })).toEqual({
      token: "Enter your invitation token.",
    })
  })
})

describe("accept staff invitation action", () => {
  it("redirects unauthenticated submissions to login with the invitation URL preserved", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.void
    })

    const response = (await action(
      actionArgs(postRequest({ token: "staff-token-1" }))
    )) as Response

    expect(calls).toBe(0)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/login?redirectTo=%2Fapp%2Fstaff-invitations%2Faccept%3Ftoken%3Durl-token"
    )
  })

  it("returns inline validation errors before calling the API", async () => {
    let calls = 0
    const action = createAction(() => {
      calls += 1
      return Effect.void
    })

    const result = (await action(
      actionArgs(
        postRequest(
          { token: "  " },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as AcceptStaffInvitationActionData

    expect(calls).toBe(0)
    expect(result.status).toBe("error")
    expect(result.fieldErrors?.token).toBe("Enter your invitation token.")
  })

  it("uses the web session cookie and redirects successful acceptances to the app", async () => {
    const calls: AcceptStaffInvitationInput[] = []
    const action = createAction((input) => {
      calls.push(input)
      return Effect.void
    })

    const response = (await action(
      actionArgs(
        postRequest(
          { token: " staff-token-1 " },
          "theme=dark; kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(calls).toEqual([
      {
        sessionId: "gym-user-session-1",
        token: "staff-token-1",
      },
    ])
    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/recorded-app?status=staff-invitation-accepted"
    )
  })

  it.each([
    ["GymStaffInvitationInvalid", "invalid or expired"],
    ["GymAccessInactive", "not active"],
    ["GymStaffSelfAssignmentDenied", "cannot accept"],
    ["GymUserUnverified", "verify your email"],
  ] as const)("returns %s failures as inline action data", async (tag, text) => {
    const action = createAction(() =>
      Effect.fail({
        _tag: tag,
      } as const)
    )

    const result = (await action(
      actionArgs(
        postRequest(
          { token: "staff-token-1" },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as AcceptStaffInvitationActionData

    expect(result.status).toBe("error")
    expect(result.formError).toContain(text)
  })

  it("redirects invalid sessions back to login with the invitation URL preserved", async () => {
    const action = createAction(() =>
      Effect.fail({
        _tag: "GymUserSessionInvalid",
        sessionId: "gym-user-session-1",
      } as const)
    )

    const response = (await action(
      actionArgs(
        postRequest(
          { token: "staff-token-1" },
          "kryno_gym_user_session=gym-user-session-1"
        )
      )
    )) as Response

    expect(response.headers.get("Location")).toBe(
      "https://kryno.test/login?redirectTo=%2Fapp%2Fstaff-invitations%2Faccept%3Ftoken%3Durl-token"
    )
  })

  it("does not swallow unexpected failures", async () => {
    const unexpected = new Error("API server unavailable")
    const action = createAction(() => Effect.fail(unexpected))

    await expect(
      action(
        actionArgs(
          postRequest(
            { token: "staff-token-1" },
            "kryno_gym_user_session=gym-user-session-1"
          )
        )
      )
    ).rejects.toBe(unexpected)
  })
})

describe("accept staff invitation form", () => {
  it("renders a confirmation form with an editable token field", () => {
    const html = renderToStaticMarkup(
      React.createElement(AcceptStaffInvitationForm, {
        initialToken: "staff-token-1",
      })
    )

    expect(html).toContain('method="post"')
    expect(html).toContain('name="token"')
    expect(html).toContain('value="staff-token-1"')
    expect(html).toContain("Accept invitation")
  })
})
