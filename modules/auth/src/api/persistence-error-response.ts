import { HttpApiError } from "effect/unstable/httpapi"

export const PersistenceFailureInternalServerError =
  HttpApiError.InternalServerErrorNoContent

export const persistenceFailureInternalServerError = () =>
  new HttpApiError.InternalServerError({})
