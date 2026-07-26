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
  deleteGymRouteInitialViewModel,
  type DeleteGymRouteViewModel,
} from "@gym/adapters-next/view-models"

type DeleteGymRouteAction = (
  previousState: DeleteGymRouteViewModel,
  formData: FormData
) => Promise<DeleteGymRouteViewModel>

export function DeleteGymRouteView({
  action,
  gymId,
  routeId,
}: {
  action: DeleteGymRouteAction
  gymId: string
  routeId: string
}) {
  const [state, formAction, pending] = useActionState(
    action,
    deleteGymRouteInitialViewModel
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" size="xs" variant="destructive">
            Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this route?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the route from the gym and also deletes the
            linked boulder and its logged attempts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="contents">
          <input type="hidden" name="gymId" value={gymId} />
          <input type="hidden" name="routeId" value={routeId} />
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
