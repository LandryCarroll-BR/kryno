import { Avatar, AvatarFallback } from "@packages/ui/components/avatar"
import { getCurrentUser } from "@/features/auth/components/current-user/current-user.query"

export async function CurrentUserView() {
  const currentUser = await getCurrentUser()

  const [first = "?"] = currentUser.username.toUpperCase().split("")

  return (
    <Avatar size="lg">
      <AvatarFallback>{first}</AvatarFallback>
    </Avatar>
  )
}
