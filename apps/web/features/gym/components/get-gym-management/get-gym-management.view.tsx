import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"
import type { GetGymManagementViewModel } from "@gym/adapters-next/view-models/get-gym-management"
import type { CreateGymAreaViewModel } from "@gym/adapters-next/view-models/create-gym-area"
import type { CreateGymRouteViewModel } from "@gym/adapters-next/view-models/create-gym-route"

import { CreateGymAreaView } from "../create-gym-area/create-gym-area.view"
import { CreateGymRouteView } from "../create-gym-route/create-gym-route.view"

type ManagementQuery = (gymId: string) => Promise<GetGymManagementViewModel>
type AreaAction = (
  previous: CreateGymAreaViewModel,
  formData: FormData
) => Promise<CreateGymAreaViewModel>
type RouteAction = (
  previous: CreateGymRouteViewModel,
  formData: FormData
) => Promise<CreateGymRouteViewModel>

export async function GetGymManagementView({
  gymId,
  query,
  createAreaAction,
  createRouteAction,
}: {
  gymId: string
  query: ManagementQuery
  createAreaAction: AreaAction
  createRouteAction: RouteAction
}) {
  const management = await query(gymId)
  const gym = management.fields.gym.value

  if (management.status !== "success" || gym === null) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{management.message}</AlertDescription>
      </Alert>
    )
  }

  const areas = management.fields.areas.value
  const boulders = management.fields.boulders.value

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage {gym.name}</CardTitle>
          <CardDescription>
            Define the gym&apos;s physical areas and current route settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateGymAreaView action={createAreaAction} gymId={gym.id} />
        </CardContent>
      </Card>

      {areas.length === 0 ? (
        <Alert>
          <AlertDescription>{management.message}</AlertDescription>
        </Alert>
      ) : (
        areas.map((area) => (
          <Card key={area.id}>
            <CardHeader>
              <CardTitle>{area.name}</CardTitle>
              <CardDescription>
                {area.routes.length === 0
                  ? "No routes have been set here yet."
                  : `${area.routes.length} current route${
                      area.routes.length === 1 ? "" : "s"
                    }.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {area.routes.map((route) => (
                  <article
                    key={route.id}
                    className="flex flex-wrap items-center gap-3 py-4 first:pt-0"
                  >
                    <Badge>#{route.order}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {route.positionLabel ?? `Route ${route.order}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Set {route.setOn}
                        {route.setterName
                          ? ` by ${route.setterName}`
                          : ""}
                      </p>
                    </div>
                    {route.boulder && (
                      <Badge
                        variant={
                          route.boulder.available
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {route.boulder.label}
                      </Badge>
                    )}
                  </article>
                ))}
              </div>
              <CreateGymRouteView
                action={createRouteAction}
                gymId={gym.id}
                areaId={area.id}
                boulders={boulders}
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
