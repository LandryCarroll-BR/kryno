import { Effect } from "effect"
import { notFound, permanentRedirect, redirect } from "next/navigation"

export const Redirect = (
  ...args: Parameters<typeof redirect>
): Effect.Effect<never, never, never> =>
  Effect.promise(async () => redirect(...args))

export const PermanentRedirect = (
  ...args: Parameters<typeof permanentRedirect>
): Effect.Effect<never, never, never> =>
  Effect.promise(async () => permanentRedirect(...args))

export const NotFound: Effect.Effect<never, never, never> = Effect.promise(
  async () => notFound()
)
