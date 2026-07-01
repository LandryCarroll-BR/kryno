import { createGym } from "@/features/gym/components/create-gym/create-gym.action"
import { CreateGymView } from "@/features/gym/components/create-gym/create-gym.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"

function CreateGymPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <CreateGymView action={createGym} />
    </div>
  )
}

export default withAuthentication(CreateGymPage, {
  requiredRole: "admin",
  unauthorizedRedirectUrl: "/dashboard",
})
