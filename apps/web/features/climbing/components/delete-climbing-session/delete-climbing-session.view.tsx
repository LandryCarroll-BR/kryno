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
  deleteClimbingSessionInitialViewModel,
  type DeleteClimbingSessionViewModel,
} from "@climbing/adapters-next/view-models/delete-climbing-session"

type DeleteClimbingSessionAction = (
  previousState: DeleteClimbingSessionViewModel,
  formData: FormData
) => Promise<DeleteClimbingSessionViewModel>

export function DeleteClimbingSessionView({
  action,
  climbingSessionId,
  startedAt,
}: {
  action: DeleteClimbingSessionAction
  climbingSessionId: string
  startedAt: string
}) {
  const [state, formAction, pending] = useActionState(
    action,
    deleteClimbingSessionInitialViewModel
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
          <AlertDialogTitle>Delete session?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the session started {formatDate(startedAt)}
            and all of its logged attempts. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={formAction} className="contents">
          <input
            type="hidden"
            name="climbingSessionId"
            value={climbingSessionId}
          />
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

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
