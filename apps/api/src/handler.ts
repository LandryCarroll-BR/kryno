import { KrynoApiWebHandler } from "./kryno-api-app.ts"

export const handler = KrynoApiWebHandler.handler as (
  request: Request
) => Promise<Response>
export const dispose = KrynoApiWebHandler.dispose
