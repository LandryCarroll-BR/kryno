import { Badge } from "@packages/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import { listCreatedBoulders } from "@/features/climbing/components/list-created-boulders/list-created-boulders.query"
import { logBoulderAttempt } from "@/features/climbing/components/log-boulder-attempt/log-boulder-attempt.action"
import { LogBoulderAttemptView } from "../log-boulder-attempt/log-boulder-attempt.view"

export async function ListCreatedBouldersView({
  query,
  action,
}: {
  query: typeof listCreatedBoulders
  action: typeof logBoulderAttempt
}) {
  const createdBoulders = await query()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your boulders</CardTitle>
        <CardDescription>
          Problems you have created, sorted by most recently updated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {createdBoulders.boulders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No boulders yet. Create one to climb later.
          </p>
        ) : (
          <div className="divide-y">
            {createdBoulders.boulders.map((boulder) => (
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
                  <LogBoulderAttemptView
                    action={action}
                    boulderId={boulder.id}
                  />
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
