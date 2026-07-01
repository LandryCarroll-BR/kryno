import { Alert, AlertDescription } from "@packages/ui/components/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"
import type { ListGymsViewModel } from "@gym/adapters-next/view-models/list-gyms"
import type { JoinGymViewModel } from "@gym/adapters-next/view-models/join-gym"

import { JoinGymView } from "../join-gym/join-gym.view"

type ListGymsQuery = () => Promise<ListGymsViewModel>
type JoinGymAction = (
  previousState: JoinGymViewModel,
  formData: FormData
) => Promise<JoinGymViewModel>

export async function ListGymsView({
  query,
  joinAction,
}: {
  query: ListGymsQuery
  joinAction: JoinGymAction
}) {
  const gymList = await query()
  const gyms = gymList.fields.gyms.value

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{gymList.fields.gyms.label}</CardTitle>
        <CardDescription>
          Find the places where you climb and join their communities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {gymList.status === "invalid" || gymList.status === "error" ? (
          <Alert variant="destructive">
            <AlertDescription>{gymList.message}</AlertDescription>
          </Alert>
        ) : gyms.length === 0 ? (
          <p className="text-sm text-muted-foreground">{gymList.message}</p>
        ) : (
          <div className="divide-y">
            {gyms.map((gym) => (
              <article
                key={gym.id}
                className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <h2 className="truncate font-medium">{gym.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {gym.isMember
                      ? "You are a member of this gym."
                      : "Join this gym to make it part of your profile."}
                  </p>
                </div>
                <JoinGymView
                  action={joinAction}
                  gymId={gym.id}
                  isMember={gym.isMember}
                />
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
