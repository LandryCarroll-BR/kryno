import { Avatar, AvatarFallback } from "@packages/ui/components/avatar"
import { getCurrentUser } from "@/features/auth/components/get-current-user/get-current-user.query"

export async function GetCurrentUserView({
  query,
}: {
  query: typeof getCurrentUser
}) {
  const currentUser = await query()

  const [first = "?"] = currentUser.username.toUpperCase().split("")

  return (
    <Avatar size="lg">
      <AvatarFallback>{first}</AvatarFallback>
    </Avatar>
  )
}
