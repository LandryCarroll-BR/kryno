import { describe, expect, it } from "@effect/vitest"
import { HttpApi } from "effect/unstable/httpapi"
import {
  AcceptGymStaffInvitationEndpoint,
  CreateGymStaffInvitationEndpoint,
} from "../src/api/endpoints/gym-staff-invitation"
import {
  ApproveGymCreationRequestEndpoint,
  CurrentGymOwnerAccessEndpoint,
  JoinGymAsMemberEndpoint,
  LeaveGymAsMemberEndpoint,
  RequestGymCreationEndpoint,
} from "../src/api/endpoints/gym-request"
import { BootstrapFirstSystemAdminEndpoint } from "../src/api/endpoints/system-admin-bootstrap"
import {
  CompleteGymUserPasswordResetEndpoint,
  RequestGymUserPasswordResetEndpoint,
} from "../src/api/endpoints/gym-user-password-reset"
import {
  CurrentGymUserSessionEndpoint,
  LoginGymUserEndpoint,
  LogoutGymUserEndpoint,
} from "../src/api/endpoints/gym-user-authentication"
import {
  CurrentSystemAdminSessionEndpoint,
  LoginSystemAdminEndpoint,
  LogoutSystemAdminEndpoint,
} from "../src/api/endpoints/system-admin-authentication"
import {
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
} from "../src/api/endpoints/gym-user-registration"
import { AuthHttpApi, AuthHttpGroup } from "../src/api/auth-group"
import {
  GymUserSessionRequired,
  SystemAdminSessionRequired,
} from "../src/api/auth-authorization"

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

const publicEndpointNames = [
  "bootstrapFirstSystemAdmin",
  "completeGymUserPasswordReset",
  "loginGymUser",
  "loginSystemAdmin",
  "requestGymUserPasswordReset",
  "reserveGymUserEmail",
  "signUpGymUser",
  "verifyGymUserEmail",
] as const

const gymUserEndpointNames = [
  "acceptGymStaffInvitation",
  "createGymStaffInvitation",
  "currentGymOwnerAccess",
  "currentGymUserSession",
  "joinGymAsMember",
  "leaveGymAsMember",
  "logoutGymUser",
  "requestGymCreation",
] as const

const systemAdminEndpointNames = [
  "approveGymCreationRequest",
  "currentSystemAdminSession",
  "logoutSystemAdmin",
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

const hasMiddleware = (
  middlewares: ReadonlySet<unknown>,
  middleware: unknown
) => middlewares.has(middleware)

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

    expect([...endpoints.keys()].sort()).toEqual(
      [...expectedEndpointNames].sort()
    )
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
      path: "/auth/gym-users/session",
      successes: [200],
      errors: [401, 403],
    })
    expect(endpoints.get("logoutGymUser")).toEqual({
      method: "DELETE",
      path: "/auth/gym-users/session",
      successes: [204],
      errors: [401],
    })
    expect(endpoints.get("currentSystemAdminSession")).toEqual({
      method: "GET",
      path: "/auth/system-admin/session",
      successes: [200],
      errors: [401],
    })
    expect(endpoints.get("logoutSystemAdmin")).toEqual({
      method: "DELETE",
      path: "/auth/system-admin/session",
      successes: [204],
      errors: [401],
    })
    expect(endpoints.get("createGymStaffInvitation")).toEqual({
      method: "POST",
      path: "/auth/gyms/staff-invitations",
      successes: [201],
      errors: [401, 403],
    })
    expect(
      [...endpoints.values()].map((endpoint) => endpoint.path)
    ).not.toContain("/auth/gym-users/sessions/:sessionId")
    expect(
      [...endpoints.values()].map((endpoint) => endpoint.path)
    ).not.toContain("/auth/system-admin/sessions/:sessionId")
  })

  it("declares the intended session audience for protected endpoints", () => {
    const endpoints = new Map<
      string,
      {
        readonly gymUser: boolean
        readonly systemAdmin: boolean
      }
    >()

    HttpApi.reflect(AuthHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, {
          gymUser: hasMiddleware(endpoint.middlewares, GymUserSessionRequired),
          systemAdmin: hasMiddleware(
            endpoint.middlewares,
            SystemAdminSessionRequired
          ),
        })
      },
    })

    for (const name of publicEndpointNames) {
      expect(endpoints.get(name)).toEqual({
        gymUser: false,
        systemAdmin: false,
      })
    }

    for (const name of gymUserEndpointNames) {
      expect(endpoints.get(name)).toEqual({
        gymUser: true,
        systemAdmin: false,
      })
    }

    for (const name of systemAdminEndpointNames) {
      expect(endpoints.get(name)).toEqual({
        gymUser: false,
        systemAdmin: true,
      })
    }
  })
})
