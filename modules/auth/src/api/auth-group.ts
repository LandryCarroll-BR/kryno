import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import { ReserveGymUserEmailEndpoint } from "./endpoints/gym-user-registration.ts"
import {
  CurrentSystemAdminSessionEndpoint,
  LoginSystemAdminEndpoint,
  LogoutSystemAdminEndpoint,
} from "./endpoints/system-admin-authentication.ts"
import { BootstrapFirstSystemAdminEndpoint } from "./endpoints/system-admin-bootstrap.ts"

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentSystemAdminSessionEndpoint)
  .add(LogoutSystemAdminEndpoint)
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
