import { beforeAll, describe, expect, it } from "@effect/vitest"
import { HttpApi } from "effect/unstable/httpapi"

import { KrynoHttpApi } from "@workspace/api"
import { handler } from "../src/handler.ts"

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
      login.session.id
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
      login.session.id
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

    const currentResponse = await get(
      "/api/auth/gym-users/session",
      login.session.id
    )
    expect(currentResponse.status).toBe(200)
    await expect(currentResponse.json()).resolves.toMatchObject({
      session: {
        id: login.session.id,
      },
    })

    const logoutResponse = await deleteRequest(
      "/api/auth/gym-users/session",
      login.session.id
    )
    expect(logoutResponse.status).toBe(204)

    const afterLogoutResponse = await get(
      "/api/auth/gym-users/session",
      login.session.id
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
      gymUserLogin.session.id
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
      adminLogin.session.id
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

  it("resolves and logs out the current system-admin session from bearer authentication", async () => {
    const loginResponse = await postJson(
      "/api/auth/system-admin/sessions",
      systemAdminCredentials
    )
    const login = await loginResponse.json()

    const currentResponse = await get(
      "/api/auth/system-admin/session",
      login.session.id
    )
    expect(currentResponse.status).toBe(200)
    await expect(currentResponse.json()).resolves.toMatchObject({
      session: {
        id: login.session.id,
      },
    })

    const logoutResponse = await deleteRequest(
      "/api/auth/system-admin/session",
      login.session.id
    )
    expect(logoutResponse.status).toBe(204)

    const afterLogoutResponse = await get(
      "/api/auth/system-admin/session",
      login.session.id
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
