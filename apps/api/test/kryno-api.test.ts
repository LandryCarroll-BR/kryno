import { beforeAll, describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { HttpServer } from "effect/unstable/http"
import { HttpApi } from "effect/unstable/httpapi"
import { HttpApiClient } from "effect/unstable/httpapi"

import { KrynoHttpApi } from "@workspace/api"
import { ReserveGymUserEmailInput } from "@workspace/auth/domain/gym-user"
import { handler } from "../src/handler.ts"
import {
  DEFAULT_LOCAL_API_HOSTNAME,
  DEFAULT_LOCAL_API_PORT,
  makeKrynoLocalApiServerLayer,
  readLocalApiServerOptions,
} from "../src/local-api-server.ts"

const systemAdminCredentials = {
  email: "admin-audience@example.com",
  password: "correct horse battery staple",
} as const

const postJson = (path: string, body: unknown, bearer?: string) =>
  handler(
    new Request(`https://kryno.test${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(bearer === undefined ? {} : { authorization: `Bearer ${bearer}` }),
      },
      body: JSON.stringify(body),
    })
  )

const get = (path: string, bearer?: string) =>
  handler(
    new Request(`https://kryno.test${path}`, {
      method: "GET",
      headers: {
        ...(bearer === undefined ? {} : { authorization: `Bearer ${bearer}` }),
      },
    })
  )

const getWithCookie = (path: string, cookie: string) =>
  handler(
    new Request(`https://kryno.test${path}`, {
      method: "GET",
      headers: {
        cookie,
      },
    })
  )

const deleteRequest = (path: string, bearer?: string) =>
  handler(
    new Request(`https://kryno.test${path}`, {
      method: "DELETE",
      headers: {
        ...(bearer === undefined ? {} : { authorization: `Bearer ${bearer}` }),
      },
    })
  )

describe("Kryno API app", () => {
  beforeAll(async () => {
    await postJson("/api/auth/system-admin/bootstrap", systemAdminCredentials)
  })

  it("serves Auth routes through the composed /api contract", async () => {
    const response = await postJson("/api/auth/gym-users/email-reservations", {
      email: "member@example.com",
      displayName: "Member Example",
    })

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      email: "member@example.com",
      displayName: "Member Example",
      emailVerified: false,
    })
  })

  it.effect("serves the typed Auth contract over a local Node HTTP server", () =>
    Effect.gen(function* () {
      const server = yield* HttpServer.HttpServer
      const baseUrl = HttpServer.formatAddress(server.address)
      const client = yield* HttpApiClient.make(KrynoHttpApi, { baseUrl }).pipe(
        Effect.provide(FetchHttpClient.layer)
      )

      const registration = yield* client.auth.reserveGymUserEmail({
        payload: new ReserveGymUserEmailInput({
          email: "local-node-server@example.com",
          displayName: "Local Node Server",
        }),
      })

      expect(registration).toMatchObject({
        email: "local-node-server@example.com",
        displayName: "Local Node Server",
        emailVerified: false,
      })
    }).pipe(
      Effect.provide(
        makeKrynoLocalApiServerLayer({
          hostname: DEFAULT_LOCAL_API_HOSTNAME,
          port: 0,
          disableListenLog: true,
        })
      )
    )
  )

  it("defaults the local API server to 127.0.0.1:4000", () => {
    expect(DEFAULT_LOCAL_API_HOSTNAME).toBe("127.0.0.1")
    expect(DEFAULT_LOCAL_API_PORT).toBe(4000)
  })

  it.effect("uses PORT to override the local API server port", () =>
    Effect.gen(function* () {
      const options = yield* readLocalApiServerOptions

      expect(options).toEqual({
        hostname: "127.0.0.1",
        port: 4217,
      })
    }).pipe(
      Effect.provide(
        ConfigProvider.layer(
          ConfigProvider.fromUnknown({
            PORT: "4217",
          })
        )
      )
    )
  )

  it("rejects anonymous requests to protected Auth routes before protected behavior runs", async () => {
    const response = await postJson("/api/auth/gyms/requests", {
      name: "Protected Gym",
    })

    expect(response.status).toBe(401)
    expect(await response.text()).toBe("")
  })

  it("rejects a system-admin session on gym-user protected routes", async () => {
    const loginResponse = await postJson(
      "/api/auth/system-admin/sessions",
      systemAdminCredentials
    )
    const login = await loginResponse.json()

    const response = await postJson(
      "/api/auth/gyms/requests",
      {
        name: "Wrong Audience Gym",
      },
      login.sessionToken
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe("")
  })

  it("rejects a gym-user session on system-admin protected routes", async () => {
    await postJson("/api/auth/gym-users/signups", {
      email: "gym-audience@example.com",
      password: "correct horse battery staple",
      displayName: "Gym Audience",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-1",
    })
    const loginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "gym-audience@example.com",
      password: "correct horse battery staple",
    })
    const login = await loginResponse.json()

    const response = await postJson(
      "/api/auth/gyms/requests/approvals",
      {
        requestId: "missing-request",
      },
      login.sessionToken
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe("")
  })

  it("resolves and logs out the current gym-user session from bearer authentication", async () => {
    await postJson("/api/auth/gym-users/signups", {
      email: "bearer-current@example.com",
      password: "correct horse battery staple",
      displayName: "Bearer Current",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-2",
    })
    const loginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "bearer-current@example.com",
      password: "correct horse battery staple",
    })
    const login = await loginResponse.json()

    const cookieOnlyResponse = await getWithCookie(
      "/api/auth/gym-users/session",
      `kryno_gym_user_session=${login.sessionToken}`
    )
    expect(cookieOnlyResponse.status).toBe(401)
    expect(await cookieOnlyResponse.text()).toBe("")

    const currentResponse = await get(
      "/api/auth/gym-users/session",
      login.sessionToken
    )
    expect(currentResponse.status).toBe(200)
    await expect(currentResponse.json()).resolves.toMatchObject({
      session: {
        id: login.session.id,
      },
    })

    const logoutResponse = await deleteRequest(
      "/api/auth/gym-users/session",
      login.sessionToken
    )
    expect(logoutResponse.status).toBe(204)

    const afterLogoutResponse = await get(
      "/api/auth/gym-users/session",
      login.sessionToken
    )
    expect(afterLogoutResponse.status).toBe(401)
    expect(await afterLogoutResponse.text()).toBe("")
  })

  it("creates and approves gym requests from bearer sessions instead of client-supplied payload session ids", async () => {
    await postJson("/api/auth/gym-users/signups", {
      email: "bearer-gym-request@example.com",
      password: "correct horse battery staple",
      displayName: "Bearer Gym Request",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-3",
    })
    const gymUserLoginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "bearer-gym-request@example.com",
      password: "correct horse battery staple",
    })
    const gymUserLogin = await gymUserLoginResponse.json()

    const requestResponse = await postJson(
      "/api/auth/gyms/requests",
      {
        name: "Bearer Boulder House",
      },
      gymUserLogin.sessionToken
    )

    expect(requestResponse.status).toBe(201)
    const request = await requestResponse.json()
    expect(request).toMatchObject({
      request: {
        requesterUserId: gymUserLogin.user.id,
        status: "pending",
      },
      gym: {
        name: "Bearer Boulder House",
        status: "pending",
      },
    })

    const adminLoginResponse = await postJson(
      "/api/auth/system-admin/sessions",
      systemAdminCredentials
    )
    const adminLogin = await adminLoginResponse.json()

    const approvalResponse = await postJson(
      "/api/auth/gyms/requests/approvals",
      {
        requestId: request.request.id,
      },
      adminLogin.sessionToken
    )

    expect(approvalResponse.status).toBe(200)
    await expect(approvalResponse.json()).resolves.toMatchObject({
      request: {
        id: request.request.id,
        status: "approved",
      },
      gym: {
        id: request.gym.id,
        status: "active",
      },
      ownerAffiliation: {
        userId: gymUserLogin.user.id,
        role: "Owner",
      },
    })
  })

  it("uses bearer-derived gym-user sessions for owner, member, and staff affiliation routes", async () => {
    await postJson("/api/auth/gym-users/signups", {
      email: "bearer-affiliation-owner@example.com",
      password: "correct horse battery staple",
      displayName: "Bearer Affiliation Owner",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-4",
    })
    const ownerLoginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "bearer-affiliation-owner@example.com",
      password: "correct horse battery staple",
    })
    const ownerLogin = await ownerLoginResponse.json()

    await postJson("/api/auth/gym-users/signups", {
      email: "bearer-affiliation-member@example.com",
      password: "correct horse battery staple",
      displayName: "Bearer Affiliation Member",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-5",
    })
    const memberLoginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "bearer-affiliation-member@example.com",
      password: "correct horse battery staple",
    })
    const memberLogin = await memberLoginResponse.json()

    await postJson("/api/auth/gym-users/signups", {
      email: "bearer-affiliation-staff@example.com",
      password: "correct horse battery staple",
      displayName: "Bearer Affiliation Staff",
    })
    await postJson("/api/auth/gym-users/email-verifications", {
      token: "gym-user-email-verification-token-6",
    })
    const staffLoginResponse = await postJson("/api/auth/gym-users/sessions", {
      email: "bearer-affiliation-staff@example.com",
      password: "correct horse battery staple",
    })
    const staffLogin = await staffLoginResponse.json()

    const requestResponse = await postJson(
      "/api/auth/gyms/requests",
      { name: "Bearer Affiliation Gym" },
      ownerLogin.sessionToken
    )
    const request = await requestResponse.json()
    const adminLoginResponse = await postJson(
      "/api/auth/system-admin/sessions",
      systemAdminCredentials
    )
    const adminLogin = await adminLoginResponse.json()
    const approvalResponse = await postJson(
      "/api/auth/gyms/requests/approvals",
      { requestId: request.request.id },
      adminLogin.sessionToken
    )
    const approval = await approvalResponse.json()

    const ownerAccessResponse = await postJson(
      "/api/auth/gyms/owner-access",
      { gymId: approval.gym.id },
      ownerLogin.sessionToken
    )
    expect(ownerAccessResponse.status).toBe(200)
    await expect(ownerAccessResponse.json()).resolves.toMatchObject({
      affiliation: {
        role: "Owner",
        userId: ownerLogin.user.id,
      },
    })

    const joinResponse = await postJson(
      "/api/auth/gyms/member-affiliations",
      { gymId: approval.gym.id },
      memberLogin.sessionToken
    )
    expect(joinResponse.status).toBe(200)
    await expect(joinResponse.json()).resolves.toMatchObject({
      affiliation: {
        role: "Member",
        userId: memberLogin.user.id,
      },
    })

    const leaveResponse = await postJson(
      "/api/auth/gyms/member-affiliations/leaves",
      { gymId: approval.gym.id },
      memberLogin.sessionToken
    )
    expect(leaveResponse.status).toBe(200)
    await expect(leaveResponse.json()).resolves.toMatchObject({
      affiliation: {
        status: "left",
        userId: memberLogin.user.id,
      },
    })

    const invitationResponse = await postJson(
      "/api/auth/gyms/staff-invitations",
      {
        gymId: approval.gym.id,
        email: "bearer-affiliation-staff@example.com",
      },
      ownerLogin.sessionToken
    )
    expect(invitationResponse.status).toBe(201)

    const acceptanceResponse = await postJson(
      "/api/auth/gyms/staff-invitations/acceptances",
      { token: "gym-staff-invitation-token-1" },
      staffLogin.sessionToken
    )
    expect(acceptanceResponse.status).toBe(200)
    await expect(acceptanceResponse.json()).resolves.toMatchObject({
      affiliation: {
        role: "Staff",
        userId: staffLogin.user.id,
      },
    })
  })

  it("resolves and logs out the current system-admin session from bearer authentication", async () => {
    const loginResponse = await postJson(
      "/api/auth/system-admin/sessions",
      systemAdminCredentials
    )
    const login = await loginResponse.json()

    const cookieOnlyResponse = await getWithCookie(
      "/api/auth/system-admin/session",
      `kryno_system_admin_session=${login.sessionToken}`
    )
    expect(cookieOnlyResponse.status).toBe(401)
    expect(await cookieOnlyResponse.text()).toBe("")

    const currentResponse = await get(
      "/api/auth/system-admin/session",
      login.sessionToken
    )
    expect(currentResponse.status).toBe(200)
    await expect(currentResponse.json()).resolves.toMatchObject({
      session: {
        id: login.session.id,
      },
    })

    const logoutResponse = await deleteRequest(
      "/api/auth/system-admin/session",
      login.sessionToken
    )
    expect(logoutResponse.status).toBe(204)

    const afterLogoutResponse = await get(
      "/api/auth/system-admin/session",
      login.sessionToken
    )
    expect(afterLogoutResponse.status).toBe(401)
    expect(await afterLogoutResponse.text()).toBe("")
  })

  it("keeps the product API contract under /api without a version prefix", () => {
    const endpoints = new Map<string, string>()

    HttpApi.reflect(KrynoHttpApi, {
      onGroup: () => undefined,
      onEndpoint: ({ endpoint }) => {
        endpoints.set(endpoint.name, endpoint.path)
      },
    })

    expect(endpoints.get("reserveGymUserEmail")).toBe(
      "/api/auth/gym-users/email-reservations"
    )
    expect([...endpoints.values()]).not.toContain(
      "/api/v1/auth/gym-users/email-reservations"
    )
  })
})
