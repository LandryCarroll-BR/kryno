import { redirect, useLoaderData, useSearchParams } from "react-router"
import { Effect } from "effect"

import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import type { Route } from "./+types/app"
import { readGymUserSessionCookie } from "../../lib/kryno-api/gym-user-session-cookie"
import {
  getKrynoApiClient,
  type KrynoApiEffect,
  type KrynoApiClientGetter,
} from "../../lib/kryno-api/kryno-api-client"
import { GymCreationRequestForm } from "../../features/auth/gym-creation-request/gym-creation-request-form"
import { GymCreationRequestViewModel } from "../../features/auth/gym-creation-request/gym-creation-request-view-model"
import { JoinGymAsMemberForm } from "../../features/auth/join-gym-as-member/join-gym-as-member-form"
import { JoinGymAsMemberViewModel } from "../../features/auth/join-gym-as-member/join-gym-as-member-view-model"

export const GymCreationRequestFormViewModel = GymCreationRequestViewModel
export const JoinGymAsMemberFormViewModel = JoinGymAsMemberViewModel

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
  readonly activeAffiliations: readonly GymAffiliation[]
}

interface GymAffiliation {
  readonly gymId: string
  readonly userId: string
  readonly role: "Owner" | "Staff" | "Member"
  readonly status: "active" | "left"
}

const isExpectedSessionFailure = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "_tag" in error &&
  (error._tag === "GymUserSessionInvalid" || error._tag === "GymUserUnverified")

const redirectToLoginWithAppReturnTarget = (request: Request) => {
  const url = new URL(request.url)
  const redirectTo = `${url.pathname}${url.search}`

  return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
}

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
      return redirectToLoginWithAppReturnTarget(request)
    }

    const client = await getClient({ sessionId })

    try {
      return await Effect.runPromise(client.auth.currentGymUserSession())
    } catch (error) {
      if (isExpectedSessionFailure(error)) {
        return redirectToLoginWithAppReturnTarget(request)
      }

      throw error
    }
  }

export const loader = createAppLoader(getKrynoApiClient)

type DashboardMessage = {
  readonly variant: "success" | "error"
  readonly message: string
}

export const AppDashboardViewModel = {
  message: (
    status: string | null,
    error: string | null
  ): DashboardMessage | undefined => {
    if (status === "pending-approval") {
      return {
        variant: "success",
        message: "Your gym creation request is pending approval.",
      }
    }

    if (status === "member-joined") {
      return {
        variant: "success",
        message: "You joined the gym.",
      }
    }

    if (status === "member-left") {
      return {
        variant: "success",
        message: "You left the gym.",
      }
    }

    if (status === "staff-invitation-created") {
      return {
        variant: "success",
        message: "The staff invitation was created.",
      }
    }

    if (error === "session-invalid") {
      return {
        variant: "error",
        message: "Your session expired. Sign in again and retry the action.",
      }
    }

    if (error === "unverified") {
      return {
        variant: "error",
        message: "Please verify your email before using that action.",
      }
    }

    if (error === "inactive-gym") {
      return {
        variant: "error",
        message: "That gym is not active yet.",
      }
    }

    if (error === "affiliation-conflict") {
      return {
        variant: "error",
        message: "Your current gym role conflicts with that action.",
      }
    }

    return undefined
  },
}

export function AppDashboard({
  session,
  message,
  gymCreationRequestFieldError,
  joinGymAsMemberFieldError,
}: {
  readonly session: CurrentGymUserSession
  readonly message?: DashboardMessage
  readonly gymCreationRequestFieldError?: string
  readonly joinGymAsMemberFieldError?: string
}) {
  const { user, activeAffiliations } = session

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid min-h-svh w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_1fr] lg:px-8">
        <aside className="space-y-6 border-b border-border pb-6 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div>
              <p className="text-lg font-semibold">{user.displayName}</p>
              <p className="break-all text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <form method="post" action="/logout">
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </aside>

        <div className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Gym dashboard
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Manage your gym memberships, ownership tasks, and staff access
              from this workspace.
            </p>
          </header>

          {message && (
            <Alert variant={message.variant === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.message}</AlertDescription>
            </Alert>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Active affiliations</h2>
              <p className="text-sm text-muted-foreground">
                Current gym IDs and roles returned by your session.
              </p>
            </div>

            {activeAffiliations.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {activeAffiliations.map((affiliation) => (
                  <article
                    key={`${affiliation.gymId}-${affiliation.role}`}
                    className="rounded-lg border border-border bg-card p-4 text-card-foreground"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm text-muted-foreground">Gym ID</p>
                        <p className="break-all font-medium">
                          {affiliation.gymId}
                        </p>
                      </div>
                      <Badge variant="secondary">{affiliation.role}</Badge>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6">
                <h3 className="font-semibold">No active gym affiliations</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Request a new gym or join one when ready.
                </p>
              </div>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <GymCreationRequestForm fieldError={gymCreationRequestFieldError} />
            <JoinGymAsMemberForm fieldError={joinGymAsMemberFieldError} />
            <div className="rounded-lg border border-border p-4">
              <h2 className="font-semibold">Staff access</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Staff invitations will attach here.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const session = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const message = AppDashboardViewModel.message(
    searchParams.get("status"),
    searchParams.get("error")
  )
  const gymCreationRequestFieldError =
    GymCreationRequestFormViewModel.fieldError(
      searchParams.get("form"),
      searchParams.get("error")
    )
  const joinGymAsMemberFieldError = JoinGymAsMemberFormViewModel.fieldError(
    searchParams.get("form"),
    searchParams.get("error")
  )

  return (
    <AppDashboard
      session={session}
      message={message}
      gymCreationRequestFieldError={gymCreationRequestFieldError}
      joinGymAsMemberFieldError={joinGymAsMemberFieldError}
    />
  )
}
