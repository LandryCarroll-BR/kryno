import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import { ReserveGymUserEmailEndpoint } from "./endpoints/gym-user-registration.ts"
import { BootstrapFirstSystemAdminEndpoint } from "./endpoints/system-admin-bootstrap.ts"

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
