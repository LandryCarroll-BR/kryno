import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx"),
  route("app/gym-creation-request", "routes/app.gym-creation-request.tsx"),
  route("app/join-gym", "routes/app.join-gym.tsx"),
  route("login", "routes/gym-user-login.tsx"),
  route("logout", "routes/gym-user-logout.tsx"),
  route("password-reset", "routes/password-reset-request.tsx"),
  route("password-reset/complete", "routes/password-reset-completion.tsx"),
  route("signup", "routes/gym-user-signup.tsx"),
  route("verify-email", "routes/manual-email-verification.tsx"),
] satisfies RouteConfig
