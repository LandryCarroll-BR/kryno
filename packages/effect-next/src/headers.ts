import { Effect } from "effect"
import { cookies, draftMode, headers } from "next/headers"

export const Cookies: Effect.Effect<
  Awaited<ReturnType<typeof cookies>>,
  never,
  never
> = Effect.promise(() => cookies())

export const Headers: Effect.Effect<
  Awaited<ReturnType<typeof headers>>,
  never,
  never
> = Effect.promise(() => headers())

export const DraftMode: Effect.Effect<
  Awaited<ReturnType<typeof draftMode>>,
  never,
  never
> = Effect.promise(() => draftMode())
