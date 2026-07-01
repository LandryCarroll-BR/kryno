import { createGymArea } from "@/features/gym/components/create-gym-area/create-gym-area.action"
import { createGymRoute } from "@/features/gym/components/create-gym-route/create-gym-route.action"
import { getGymManagement } from "@/features/gym/components/get-gym-management/get-gym-management.query"
import { GetGymManagementView } from "@/features/gym/components/get-gym-management/get-gym-management.view"
import { withAuthentication } from "@/features/auth/utils/with-authentication"

async function ManageGymPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params

  return (
    <main className="min-h-screen bg-zinc-50 p-8 font-sans dark:bg-black">
      <GetGymManagementView
        gymId={gymId}
        query={getGymManagement}
        createAreaAction={createGymArea}
        createRouteAction={createGymRoute}
      />
    </main>
  )
}

export default withAuthentication(ManageGymPage, {
  requiredRole: "admin",
  unauthorizedRedirectUrl: "/dashboard",
})
