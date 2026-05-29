import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("signup", "routes/gym-user-signup.tsx"),
  route("verify-email", "routes/manual-email-verification.tsx"),
] satisfies RouteConfig
