import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Badge } from "@packages/ui/components/badge"

import type { GetGymManagementViewModel } from "@gym/adapters-next/view-models/get-gym-management"
import type { CreateGymAreaViewModel } from "@gym/adapters-next/view-models/create-gym-area"
import type { CreateGymRouteViewModel } from "@gym/adapters-next/view-models/create-gym-route"
import type { DeleteGymRouteViewModel } from "@gym/adapters-next/view-models"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"

import { CreateGymAreaView } from "../create-gym-area/create-gym-area.view"
import { CreateGymRouteView } from "../create-gym-route/create-gym-route.view"
import { DeleteGymRouteView } from "../delete-gym-route/delete-gym-route.view"
import { BoulderColorBadge } from "@/features/climbing/components/boulder-color-badge/boulder-color-badge.view"

type ManagementQuery = (gymId: string) => Promise<GetGymManagementViewModel>
type AreaAction = (
  previous: CreateGymAreaViewModel,
  formData: FormData
) => Promise<CreateGymAreaViewModel>
type RouteAction = (
  previous: CreateGymRouteViewModel,
  formData: FormData
) => Promise<CreateGymRouteViewModel>
type DeleteRouteAction = (
  previous: DeleteGymRouteViewModel,
  formData: FormData
) => Promise<DeleteGymRouteViewModel>

export async function GetGymManagementView({
  gymId,
  query,
  createAreaAction,
  createRouteAction,
  deleteRouteAction,
}: {
  gymId: string
  query: ManagementQuery
  createAreaAction: AreaAction
  createRouteAction: RouteAction
  deleteRouteAction: DeleteRouteAction
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
                    {route.imageUrl !== null && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={route.imageUrl}
                        alt={`${route.positionLabel ?? `Route ${route.order}`} preview`}
                        className="h-16 w-24 rounded-md border object-cover"
                        width={96}
                        height={64}
                      />
                    )}
                    <Badge>#{route.order}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {route.positionLabel ?? `Route ${route.order}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Set {route.setOn}
                        {route.setterName ? ` by ${route.setterName}` : ""}
                      </p>
                    </div>
                    {route.boulder &&
                      (route.boulder.available ? (
                        <BoulderColorBadge color={route.boulder.color}>
                          {route.boulder.label}
                        </BoulderColorBadge>
                      ) : (
                        <Badge variant="destructive">
                          {route.boulder.label}
                        </Badge>
                      ))}
                    <DeleteGymRouteView
                      action={deleteRouteAction}
                      gymId={gym.id}
                      routeId={route.id}
                    />
                  </article>
                ))}
              </div>
              <CreateGymRouteView
                action={createRouteAction}
                gymId={gym.id}
                areaId={area.id}
                areaName={area.name}
                nextOrder={area.nextOrder}
                boulders={boulders}
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
