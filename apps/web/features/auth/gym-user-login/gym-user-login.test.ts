import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import type { AddressInfo } from "node:net"
import { describe, expect, it } from "vitest"

import { gymUserLoginAction } from "./gym-user-login-action"
import type { LoginActionData } from "./gym-user-login-view-model"

const actionRequest = (body: URLSearchParams) =>
  new Request("https://kryno.test/login", {
    method: "POST",
    body,
  })

const localActionRequest = (body: URLSearchParams) =>
  new Request("http://localhost:5173/login", {
    method: "POST",
    body,
  })

const loginSuccess = {
  user: {
    id: "gym-user-1",
    email: "member@test.dev",
    displayName: "Member Test",
    emailVerified: true,
  },
  session: {
    id: "gym-user-session-1",
    userId: "gym-user-1",
    active: true,
  },
}

const readRequestBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const body = Buffer.concat(chunks).toString("utf8")
  return body ? JSON.parse(body) : undefined
}

const writeJson = (
  response: ServerResponse,
  status: number,
  body: unknown
) => {
  response.writeHead(status, {
    "content-type": "application/json",
  })
  response.end(JSON.stringify(body))
}

const withLoginApiServer = async (
  resolveResponse: (body: unknown) => {
    readonly status: number
    readonly body: unknown
  },
  run: (context: {
    readonly bodies: readonly unknown[]
    readonly requests: readonly {
      readonly method?: string
      readonly url?: string
    }[]
  }) => Promise<void>
) => {
  const previousBaseUrl = process.env.KRYNO_API_BASE_URL
  const bodies: unknown[] = []
  const requests: {
    readonly method?: string
    readonly url?: string
  }[] = []

  const server = createServer(async (request, response) => {
    requests.push({
      method: request.method,
      url: request.url,
    })

    if (
      request.method !== "POST" ||
      request.url !== "/api/auth/gym-users/sessions"
    ) {
      writeJson(response, 404, { error: "Unexpected request" })
      return
    }

    const body = await readRequestBody(request)
    bodies.push(body)

    const nextResponse = resolveResponse(body)
    writeJson(response, nextResponse.status, nextResponse.body)
  })

  try {
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve)
    })

    const address = server.address() as AddressInfo
    process.env.KRYNO_API_BASE_URL = `http://127.0.0.1:${address.port}`

    await run({ bodies, requests })
  } finally {
    if (previousBaseUrl === undefined) {
      delete process.env.KRYNO_API_BASE_URL
    } else {
      process.env.KRYNO_API_BASE_URL = previousBaseUrl
    }

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
}

describe("gym-user login action", () => {
  it("returns inline validation errors before calling the API client", async () => {
    await withLoginApiServer(
      () => ({ status: 500, body: { error: "Unexpected API call" } }),
      async ({ requests }) => {
        const result = (await gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "not-an-email",
              password: "",
            })
          ),
        })) as LoginActionData

        expect(requests).toHaveLength(0)
        expect(result.status).toBe("error")
        expect(result.fieldErrors).toEqual({
          email: "Enter a valid email.",
          password: "Enter your password.",
        })
      }
    )
  })

  it("requires the API base URL to be configured", async () => {
    const previousBaseUrl = process.env.KRYNO_API_BASE_URL
    delete process.env.KRYNO_API_BASE_URL

    try {
      await expect(
        gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "member@test.dev",
              password: "correct horse battery staple",
            })
          ),
        })
      ).rejects.toThrow("KRYNO_API_BASE_URL must be configured")
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.KRYNO_API_BASE_URL
      } else {
        process.env.KRYNO_API_BASE_URL = previousBaseUrl
      }
    }
  })

  it("returns expected auth failures as inline action data", async () => {
    await withLoginApiServer(
      () => ({
        status: 401,
        body: {
          _tag: "GymUserInvalidCredentials",
          email: "missing@test.dev",
        },
      }),
      async () => {
        const result = (await gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "missing@test.dev",
              password: "correct horse battery staple",
            })
          ),
        })) as LoginActionData

        expect(result.status).toBe("error")
        expect(result.formError).toContain("email and password")
      }
    )
  })

  it("returns unverified-user failures as inline action data", async () => {
    await withLoginApiServer(
      () => ({
        status: 403,
        body: { _tag: "GymUserUnverified", userId: "gym-user-1" },
      }),
      async () => {
        const result = (await gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "member@test.dev",
              password: "correct horse battery staple",
            })
          ),
        })) as LoginActionData

        expect(result.status).toBe("error")
        expect(result.formError).toContain("verify your email")
      }
    )
  })

  it("redirects successful logins to the app with a web-owned session cookie", async () => {
    await withLoginApiServer(
      () => ({ status: 200, body: loginSuccess }),
      async ({ bodies }) => {
        const response = (await gymUserLoginAction({
          request: actionRequest(
            new URLSearchParams({
              email: "MEMBER@TEST.DEV",
              password: "correct horse battery staple",
            })
          ),
        })) as Response

        expect(bodies).toEqual([
          {
            email: "member@test.dev",
            password: "correct horse battery staple",
          },
        ])
        expect(response.status).toBe(302)
        expect(response.headers.get("Location")).toBe("/app")
        expect(response.headers.getSetCookie()).toEqual([
          "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax; Secure",
        ])
      }
    )
  })

  it("does not mark the session cookie secure for local HTTP development", async () => {
    await withLoginApiServer(
      () => ({ status: 200, body: loginSuccess }),
      async () => {
        const response = (await gymUserLoginAction({
          request: localActionRequest(
            new URLSearchParams({
              email: "member@test.dev",
              password: "correct horse battery staple",
            })
          ),
        })) as Response

        expect(response.headers.getSetCookie()).toEqual([
          "kryno_gym_user_session=gym-user-session-1; Path=/; HttpOnly; SameSite=Lax",
        ])
      }
    )
  })
})
