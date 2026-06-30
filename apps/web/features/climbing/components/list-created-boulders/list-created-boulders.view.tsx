import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import type {
  CreatedBoulderViewModel,
  ListCreatedBouldersViewModel,
} from "@climbing/adapters-next/view-models/list-created-boulders"
import type { DeleteBoulderViewModel } from "@climbing/adapters-next/view-models/delete-boulder"
import type { LogBoulderAttemptViewModel } from "@climbing/adapters-next/view-models/log-boulder-attempt"

import { DeleteBoulderView } from "../delete-boulder/delete-boulder.view"
import { LogBoulderAttemptView } from "../log-boulder-attempt/log-boulder-attempt.view"

type ListCreatedBouldersQuery = () => Promise<ListCreatedBouldersViewModel>

type LogBoulderAttemptAction = (
  previousState: LogBoulderAttemptViewModel,
  formData: FormData
) => Promise<LogBoulderAttemptViewModel>

type DeleteBoulderAction = (
  previousState: DeleteBoulderViewModel,
  formData: FormData
) => Promise<DeleteBoulderViewModel>

export async function ListCreatedBouldersView({
  query,
  logAttemptAction,
  deleteAction,
}: {
  query: ListCreatedBouldersQuery
  logAttemptAction: LogBoulderAttemptAction
  deleteAction: DeleteBoulderAction
}) {
  const createdBoulders = await query()
  const boulders = createdBoulders.fields.boulders.value

  return (
    <Card>
      <CardHeader>
        <CardTitle>{createdBoulders.fields.boulders.label}</CardTitle>
        <CardDescription>
          Problems you have created, sorted by most recently updated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {createdBoulders.status === "invalid" ||
        createdBoulders.status === "error" ? (
          <Alert variant="destructive">
            <AlertDescription>{createdBoulders.message}</AlertDescription>
          </Alert>
        ) : boulders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {createdBoulders.message}
          </p>
        ) : (
          <div className="divide-y">
            {boulders.map((boulder) => (
              <article
                key={boulder.id}
                className="space-y-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-medium">
                        {boulder.name}
                      </h2>
                      <Badge variant="secondary">{boulder.grade}</Badge>
                    </div>
                    <div className="flex flex-wrap divide-x text-xs text-muted-foreground">
                      <span className="pr-2">{boulder.wallAngle}</span>
                      <span className="pl-2">{boulder.movementStyle}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDate(boulder.updatedAt)}
                    </p>
                    <div className="flex flex-wrap items-start gap-2">
                      <LogBoulderAttemptView
                        action={logAttemptAction}
                        boulderId={boulder.id}
                      />
                      <DeleteBoulderView
                        action={deleteAction}
                        boulderId={boulder.id}
                        boulderName={boulder.name}
                      />
                    </div>
                  </div>
                </div>
                <BoulderAttemptHistory boulder={boulder} />
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BoulderAttemptHistory({
  boulder,
}: {
  boulder: CreatedBoulderViewModel
}) {
  return (
    <details className="group rounded-lg border bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <span>Attempt history ({boulder.attemptCount})</span>
        <span className="text-xs font-normal text-muted-foreground">
          {boulder.attemptCount === 0
            ? "No attempts yet"
            : `${boulder.sessions.length} ${
                boulder.sessions.length === 1 ? "session" : "sessions"
              }`}
        </span>
      </summary>
      <div className="space-y-4 border-t px-3 py-3">
        {boulder.attemptCount === 0 ? (
          <p className="text-sm text-muted-foreground">No attempts yet.</p>
        ) : (
          boulder.sessions.map((session) => (
            <section key={session.id} className="space-y-2">
              <div>
                <h3 className="text-sm font-medium">{session.label}</h3>
                <p className="text-xs text-muted-foreground">
                  Started {formatDate(session.startedAt)}
                  {session.endedAt === null
                    ? ""
                    : ` · Ended ${formatDate(session.endedAt)}`}
                </p>
              </div>
              <ol className="space-y-2">
                {session.attempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex flex-wrap items-center gap-2 rounded-md bg-background px-3 py-2 text-sm"
                  >
                    <span className="font-medium">
                      Attempt {attempt.ordinal}
                    </span>
                    <Badge
                      variant={
                        attempt.outcome.value === "TOPPED"
                          ? "default"
                          : "outline"
                      }
                    >
                      {attempt.outcome.label}
                    </Badge>
                    <time
                      dateTime={attempt.occurredAt}
                      className="ml-auto text-xs text-muted-foreground"
                    >
                      {formatDate(attempt.occurredAt)}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
      </div>
    </details>
  )
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
