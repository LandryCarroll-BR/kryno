import Link from "next/link"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"
import { buttonVariants } from "@packages/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"
import type { EndClimbingSessionViewModel } from "@climbing/adapters-next/view-models/end-climbing-session"
import type { GetCurrentClimbingSessionViewModel } from "@climbing/adapters-next/view-models/get-current-climbing-session"
import type { StartClimbingSessionViewModel } from "@climbing/adapters-next/view-models/start-climbing-session"
import type { JoinGymViewModel } from "@gym/adapters-next/view-models/join-gym"
import type { ListGymRouteAttemptHistoryViewModel } from "@gym/adapters-next/view-models/list-gym-route-attempt-history"
import type { LogGymRouteAttemptViewModel } from "@gym/adapters-next/view-models/log-gym-route-attempt"

import { GetCurrentClimbingSessionView } from "@/features/climbing/components/get-current-climbing-session/get-current-climbing-session.view"
import { BoulderColorBadge } from "@/features/climbing/components/boulder-color-badge/boulder-color-badge.view"
import { JoinGymView } from "../join-gym/join-gym.view"
import { LogGymRouteAttemptView } from "../log-gym-route-attempt/log-gym-route-attempt.view"

type GetGymRoutesQuery = (
  gymId: string
) => Promise<ListGymRouteAttemptHistoryViewModel>
type JoinGymAction = (
  previousState: JoinGymViewModel,
  formData: FormData
) => Promise<JoinGymViewModel>
type GetCurrentClimbingSessionQuery =
  () => Promise<GetCurrentClimbingSessionViewModel>
type StartClimbingSessionAction = (
  previousState: StartClimbingSessionViewModel,
  formData: FormData
) => Promise<StartClimbingSessionViewModel>
type EndClimbingSessionAction = (
  previousState: EndClimbingSessionViewModel,
  formData: FormData
) => Promise<EndClimbingSessionViewModel>
type LogGymRouteAttemptAction = (
  previousState: LogGymRouteAttemptViewModel,
  formData: FormData
) => Promise<LogGymRouteAttemptViewModel>

export async function GetGymRoutesView({
  gymId,
  query,
  joinAction,
  currentSessionQuery,
  startSessionAction,
  endSessionAction,
  logAttemptAction,
}: {
  gymId: string
  query: GetGymRoutesQuery
  joinAction: JoinGymAction
  currentSessionQuery: GetCurrentClimbingSessionQuery
  startSessionAction: StartClimbingSessionAction
  endSessionAction: EndClimbingSessionAction
  logAttemptAction: LogGymRouteAttemptAction
}) {
  const result = await query(gymId)
  const gym = result.fields.gym.value

  if (result.status !== "success" || gym === null) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
    )
  }

  if (!gym.isMember) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{gym.name}</CardTitle>
          <CardDescription>{result.message}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-start justify-between gap-4">
          <Link href="/gyms" className={buttonVariants({ variant: "outline" })}>
            Back to gyms
          </Link>
          <JoinGymView action={joinAction} gymId={gym.id} isMember={false} />
        </CardContent>
      </Card>
    )
  }

  const areas = result.fields.areas.value

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{gym.name}</h1>
          <p className="text-muted-foreground">
            Current boulders, grouped by area.
          </p>
        </div>
        <Link href="/gyms" className={buttonVariants({ variant: "outline" })}>
          Back to gyms
        </Link>
      </div>

      <GetCurrentClimbingSessionView
        query={currentSessionQuery}
        startAction={startSessionAction}
        endAction={endSessionAction}
      />

      {areas.length === 0 ? (
        <Alert>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      ) : (
        areas.map((area) => (
          <Card key={area.id}>
            <CardHeader>
              <CardTitle>{area.name}</CardTitle>
              <CardDescription>
                {area.routes.length === 0
                  ? "No current boulders in this area."
                  : `${area.routes.length} current boulder${
                      area.routes.length === 1 ? "" : "s"
                    }.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {area.routes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Check back after the next setting day.
                </p>
              ) : (
                <div className="divide-y">
                  {area.routes.map((route) => (
                    <article
                      key={route.id}
                      className="flex flex-wrap items-start gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      {route.imageUrl !== null && (
                        <img
                          src={route.imageUrl}
                          alt={`${route.positionLabel ?? `Route ${route.order}`} preview`}
                          className="h-32 w-full rounded-md border object-cover sm:w-48"
                        />
                      )}
                      <Badge>#{route.order}</Badge>
                      <div className="min-w-52 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-medium">{route.boulder.name}</h2>
                          {route.boulder.available ? (
                            <BoulderColorBadge color={route.boulder.color}>
                              {route.boulder.grade}
                            </BoulderColorBadge>
                          ) : (
                            <Badge variant="destructive">Unavailable</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {route.positionLabel ?? `Route ${route.order}`} · Set{" "}
                          {route.setOn}
                          {route.setterName ? ` by ${route.setterName}` : ""}
                        </p>
                        {route.boulder.available && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {humanize(route.boulder.wallAngle)} ·{" "}
                            {humanize(route.boulder.movementStyle)}
                          </p>
                        )}
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                            <span>Attempts</span>
                            <Badge variant="outline">
                              {route.attemptCount}
                            </Badge>
                          </div>
                          {route.attemptCount === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No attempts yet.
                            </p>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {route.attempts.map((attempt) => (
                                <div
                                  key={attempt.id}
                                  className="rounded-md border bg-background px-3 py-2 text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      Attempt {attempt.ordinal}
                                    </span>
                                    <Badge
                                      variant={
                                        attempt.outcome.value === "TOPPED"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {attempt.outcome.label}
                                    </Badge>
                                  </div>
                                  <time
                                    className="mt-1 block text-xs text-muted-foreground"
                                    dateTime={attempt.occurredAt}
                                  >
                                    {formatDate(attempt.occurredAt)}
                                  </time>
                                  {attempt.moveTypes.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {attempt.moveTypes.map((moveType) => (
                                        <Badge
                                          key={moveType.value}
                                          variant="secondary"
                                        >
                                          {moveType.label}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {route.boulder.available ? (
                        <LogGymRouteAttemptView
                          action={logAttemptAction}
                          gymId={gym.id}
                          routeId={route.id}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Attempts disabled
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

const humanize = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
