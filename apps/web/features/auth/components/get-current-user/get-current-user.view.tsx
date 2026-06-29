import { Avatar, AvatarFallback } from "@packages/ui/components/avatar"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import type { GetCurrentUserViewModel } from "@auth/adapters-next/view-models/get-current-user"

type GetCurrentUserQuery = () => Promise<GetCurrentUserViewModel>

export async function GetCurrentUserView({
  query,
}: {
  query: GetCurrentUserQuery
}) {
  const currentUser = await query()

  if (currentUser.status !== "success") {
    return (
      <Alert variant="destructive">
        <AlertDescription>{currentUser.message}</AlertDescription>
      </Alert>
    )
  }

  const [first = "?"] = currentUser.fields.username.value
    .toUpperCase()
    .split("")

  return (
    <Avatar size="lg">
      <AvatarFallback>{first}</AvatarFallback>
    </Avatar>
  )
}
