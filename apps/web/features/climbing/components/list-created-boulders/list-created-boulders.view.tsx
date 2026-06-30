import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import type { ListCreatedBouldersViewModel } from "@climbing/adapters-next/view-models/list-created-boulders"
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
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
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
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
