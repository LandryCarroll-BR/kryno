const sessionCookieName = "kryno_gym_user_session"

const isLocalHttpDevelopment = (request: Request) => {
  const url = new URL(request.url)

  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1")
  )
}

export const readGymUserSessionCookie = (request: Request) => {
  const cookieHeader = request.headers.get("Cookie")

  if (cookieHeader === null) {
    return undefined
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=")
    if (name === sessionCookieName) {
      const value = valueParts.join("=")
      return value.length > 0 ? decodeURIComponent(value) : undefined
    }
  }

  return undefined
}

export const serializeGymUserSessionCookie = (
  sessionId: string,
  request: Request
) => {
  const attributes = [
    `${sessionCookieName}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ]

  if (!isLocalHttpDevelopment(request)) {
    attributes.push("Secure")
  }

  return attributes.join("; ")
}
