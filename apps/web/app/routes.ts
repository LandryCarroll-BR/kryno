import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx"),
  route("login", "routes/gym-user-login.tsx"),
  route("logout", "routes/gym-user-logout.tsx"),
  route("signup", "routes/gym-user-signup.tsx"),
  route("verify-email", "routes/manual-email-verification.tsx"),
] satisfies RouteConfig
