import { Effect } from "effect"
import { revalidatePath, revalidateTag } from "next/cache"

export const RevalidatePath = (
  ...args: Parameters<typeof revalidatePath>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => revalidatePath(...args))

export const RevalidateTag = (
  ...args: Parameters<typeof revalidateTag>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => revalidateTag(...args))
