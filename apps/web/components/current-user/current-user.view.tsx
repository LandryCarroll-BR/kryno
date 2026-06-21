import { getCurrentUser } from "@/components/current-user/current-user.query"
import { Avatar, AvatarFallback } from "@packages/ui/components/avatar"

export async function CurrentUserView() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <p>Not signed in</p>
  }

  const [first = "?"] = currentUser.username.toUpperCase().split("")

  return (
    <Avatar size="lg">
      <AvatarFallback>{first}</AvatarFallback>
    </Avatar>
  )
}
