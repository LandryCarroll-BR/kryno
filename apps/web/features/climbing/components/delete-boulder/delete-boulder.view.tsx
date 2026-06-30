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
  deleteBoulderInitialViewModel,
  type DeleteBoulderViewModel,
} from "@climbing/adapters-next/view-models/delete-boulder"

type DeleteBoulderAction = (
  previousState: DeleteBoulderViewModel,
  formData: FormData
) => Promise<DeleteBoulderViewModel>

export function DeleteBoulderView({
  action,
  boulderId,
  boulderName,
}: {
  action: DeleteBoulderAction
  boulderId: string
  boulderName: string
}) {
  const [state, formAction, pending] = useActionState(
    action,
    deleteBoulderInitialViewModel
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" size="sm" variant="destructive">
            Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {boulderName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the boulder and all of its logged
            attempts. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="contents">
          <input type="hidden" name="boulderId" value={boulderId} />
          {state.message !== "" && state.status !== "success" && (
            <p
              aria-live="polite"
              className="text-sm text-destructive"
            >
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
              {pending ? "Deleting…" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
