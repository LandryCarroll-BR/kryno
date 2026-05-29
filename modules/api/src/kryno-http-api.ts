import { AuthHttpGroup } from "@workspace/auth/api/auth-group"
import { HttpApi } from "effect/unstable/httpapi"

export const KrynoHttpApi = HttpApi.make("KrynoHttpApi")
  .add(AuthHttpGroup)
  .prefix("/api")
