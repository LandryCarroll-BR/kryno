import { Form, redirect, useLoaderData } from "react-router"
import { Effect } from "effect"

import { Button } from "@workspace/ui/components/button"

import type { Route } from "./+types/app"
import { readGymUserSessionCookie } from "../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
  type KrynoApiClientGetter,
} from "../../lib/kryno-api/kryno-api-client"

interface CurrentGymUserSession {
  readonly user: {
    readonly id: string
    readonly email: string
    readonly displayName: string
    readonly emailVerified: boolean
  }
  readonly session: {
    readonly id: string
    readonly userId: string
    readonly active: boolean
  }
  readonly activeAffiliations: readonly unknown[]
}

const isExpectedSessionFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  (error._tag === "GymUserSessionInvalid" || error._tag === "GymUserUnverified")

export const createAppLoader =
  (
    getClient: KrynoApiClientGetter<{
      readonly auth: {
        readonly currentGymUserSession: () => KrynoApiEffect<CurrentGymUserSession>
      }
    }>
  ) =>
  async ({ request }: Route.LoaderArgs) => {
    const sessionId = readGymUserSessionCookie(request)

    if (sessionId === undefined) {
      return redirect("/login")
    }

    const client = await getClient({ sessionId })

    try {
      return await Effect.runPromise(client.auth.currentGymUserSession())
    } catch (error) {
      if (isExpectedSessionFailure(error)) {
        return redirect("/login")
      }

      throw error
    }
  }

export const loader = createAppLoader(getKrynoApiClient)

export default function App() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Welcome, {user.displayName}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Your gym dashboard is ready.
            </p>
          </div>
          <Form method="post" action="/logout">
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </Form>
        </div>
      </section>
    </main>
  )
}
