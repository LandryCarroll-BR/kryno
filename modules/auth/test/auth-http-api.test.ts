import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit } from "effect"
import { HttpApi } from "effect/unstable/httpapi"

import { Auth } from "@workspace/auth"
import {
  AcceptGymStaffInvitationEndpoint,
  ApproveGymCreationRequestEndpoint,
  AuthHttpApi,
  AuthHttpGroup,
  BootstrapFirstSystemAdminEndpoint,
  CompleteGymUserPasswordResetEndpoint,
  CreateGymStaffInvitationEndpoint,
  CurrentGymOwnerAccessEndpoint,
  CurrentGymUserSessionEndpoint,
  CurrentSystemAdminSessionEndpoint,
  JoinGymAsMemberEndpoint,
  LeaveGymAsMemberEndpoint,
  LoginGymUserEndpoint,
  LoginSystemAdminEndpoint,
  LogoutGymUserEndpoint,
  LogoutSystemAdminEndpoint,
  RequestGymCreationEndpoint,
  RequestGymUserPasswordResetEndpoint,
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
  buildAuthHttpHandlers,
} from "../src/api/auth-api"
import { AuthMock } from "../src/layers/mock-layer"
import { AuthTestLayer } from "../src/layers/test-layer"

const expectedEndpointNames = [
  "acceptGymStaffInvitation",
  "approveGymCreationRequest",
  "bootstrapFirstSystemAdmin",
  "completeGymUserPasswordReset",
  "createGymStaffInvitation",
  "currentGymOwnerAccess",
  "currentGymUserSession",
  "currentSystemAdminSession",
  "joinGymAsMember",
  "leaveGymAsMember",
  "loginGymUser",
  "loginSystemAdmin",
  "logoutGymUser",
  "logoutSystemAdmin",
  "requestGymCreation",
  "requestGymUserPasswordReset",
  "reserveGymUserEmail",
  "signUpGymUser",
  "verifyGymUserEmail",
] as const

const exportedEndpoints = [
  AcceptGymStaffInvitationEndpoint,
  ApproveGymCreationRequestEndpoint,
  BootstrapFirstSystemAdminEndpoint,
  CompleteGymUserPasswordResetEndpoint,
  CreateGymStaffInvitationEndpoint,
  CurrentGymOwnerAccessEndpoint,
  CurrentGymUserSessionEndpoint,
  CurrentSystemAdminSessionEndpoint,
  JoinGymAsMemberEndpoint,
  LeaveGymAsMemberEndpoint,
  LoginGymUserEndpoint,
  LoginSystemAdminEndpoint,
  LogoutGymUserEndpoint,
  LogoutSystemAdminEndpoint,
  RequestGymCreationEndpoint,
  RequestGymUserPasswordResetEndpoint,
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
] as const

const collectHandlers = () => {
  const handlersByName = new Map<
    string,
    (request: unknown) => Effect.Effect<unknown, unknown, Auth>
  >()
  const handlers = {
    handle: (
      name: string,
      handler: (request: unknown) => Effect.Effect<unknown, unknown, Auth>
    ) => {
      handlersByName.set(name, handler)
      return handlers
    },
  }

  buildAuthHttpHandlers(handlers as never)

  return handlersByName
}

const expectFailureTag = <Tag extends string>(
  exit: Exit.Exit<unknown, { readonly _tag: string }>,
  tag: Tag
) => {
  expect(Exit.isFailure(exit)).toBe(true)
  if (Exit.isFailure(exit)) {
    const failure = exit.cause.reasons.find(Cause.isFailReason)
    expect(failure?.error._tag).toBe(tag)
  }
}

describe("Auth HTTP API contracts", () => {
  it("exports every auth endpoint contract from the module API surface", () => {
    expect(AuthHttpGroup.identifier).toBe("auth")
    expect(exportedEndpoints.map((endpoint) => endpoint.name).sort()).toEqual(
      [...expectedEndpointNames].sort()
    )
  })

  it("registers schema-backed endpoints with expected HTTP success and error statuses", () => {
    const endpoints = new Map<
      string,
      {
        readonly method: string
        readonly path: string
        readonly successes: readonly number[]
        readonly errors: readonly number[]
      }
    >()

    HttpApi.reflect(AuthHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint, successes, errors }) => {
        endpoints.set(endpoint.name, {
          method: endpoint.method,
          path: endpoint.path,
          successes: [...successes.keys()].sort(),
          errors: [...errors.keys()].sort(),
        })
      },
    })

    expect([...endpoints.keys()].sort()).toEqual([...expectedEndpointNames].sort())
    expect(endpoints.get("bootstrapFirstSystemAdmin")).toEqual({
      method: "POST",
      path: "/auth/system-admin/bootstrap",
      successes: [200],
      errors: [409],
    })
    expect(endpoints.get("signUpGymUser")).toEqual({
      method: "POST",
      path: "/auth/gym-users/signups",
      successes: [201],
      errors: [409],
    })
    expect(endpoints.get("currentGymUserSession")).toEqual({
      method: "GET",
      path: "/auth/gym-users/sessions/:sessionId",
      successes: [200],
      errors: [401, 403],
    })
    expect(endpoints.get("createGymStaffInvitation")).toEqual({
      method: "POST",
      path: "/auth/gyms/staff-invitations",
      successes: [201],
      errors: [401, 403],
    })
  })
})

describe("Auth HTTP handlers", () => {
  it.effect("delegates success paths to the public Auth facade", () =>
    Effect.gen(function* () {
      const handlers = collectHandlers()
      const loginGymUser = handlers.get("loginGymUser")
      expect(loginGymUser).toBeDefined()

      const result = yield* loginGymUser!({
        payload: {
          email: "member@example.com",
          password: "correct horse battery staple",
        },
      })

      expect(result).toMatchObject({
        user: {
          email: "member@example.com",
        },
        session: {
          active: true,
        },
      })
    }).pipe(Effect.provide(AuthMock))
  )

  it.effect("delegates expected domain failures through the HTTP handler effect", () =>
    Effect.gen(function* () {
      const handlers = collectHandlers()
      const currentGymUserSession = handlers.get("currentGymUserSession")
      expect(currentGymUserSession).toBeDefined()

      const result = yield* Effect.exit(
        (
          currentGymUserSession!({
            params: {
              sessionId: "missing-session",
            },
          }) as Effect.Effect<unknown, { readonly _tag: string }, Auth>
        )
      )

      expectFailureTag(result, "GymUserSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )
})
