import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import {
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
} from "./endpoints/gym-user-registration.ts"
import {
  CurrentGymUserSessionEndpoint,
  LoginGymUserEndpoint,
  LogoutGymUserEndpoint,
} from "./endpoints/gym-user-authentication.ts"
import {
  CurrentSystemAdminSessionEndpoint,
  LoginSystemAdminEndpoint,
  LogoutSystemAdminEndpoint,
} from "./endpoints/system-admin-authentication.ts"
import { BootstrapFirstSystemAdminEndpoint } from "./endpoints/system-admin-bootstrap.ts"

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(SignUpGymUserEndpoint)
  .add(VerifyGymUserEmailEndpoint)
  .add(LoginGymUserEndpoint)
  .add(CurrentGymUserSessionEndpoint)
  .add(LogoutGymUserEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentSystemAdminSessionEndpoint)
  .add(LogoutSystemAdminEndpoint)
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
