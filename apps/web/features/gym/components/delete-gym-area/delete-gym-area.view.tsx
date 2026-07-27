"use client"

import { useActionState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@packages/ui/components/alert-dialog"
import { Button } from "@packages/ui/components/button"
import {
  deleteGymAreaInitialViewModel,
  type DeleteGymAreaViewModel,
} from "@gym/adapters-next/view-models"

type DeleteGymAreaAction = (
  previousState: DeleteGymAreaViewModel,
  formData: FormData
) => Promise<DeleteGymAreaViewModel>

export function DeleteGymAreaView({
  action,
  gymId,
  areaId,
  areaName,
  routeCount,
}: {
  action: DeleteGymAreaAction
  gymId: string
  areaId: string
  areaName: string
  routeCount: number
}) {
  const [state, formAction, pending] = useActionState(
    action,
    deleteGymAreaInitialViewModel
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" size="xs" variant="destructive">
            Delete area
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {areaName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the area
            {routeCount === 0
              ? "."
              : `, its ${routeCount} route${
                  routeCount === 1 ? "" : "s"
                }, and each linked boulder and logged attempt.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="contents">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="areaId" value={areaId} />
          {state.message !== "" && state.status !== "success" && (
            <p aria-live="polite" className="text-sm text-destructive">
              {state.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant="destructive"
              disabled={pending}
            >
              {pending ? "Deleting..." : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
