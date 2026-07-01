import { withAuthentication } from "@/features/auth/utils/with-authentication"
import { joinGym } from "@/features/gym/components/join-gym/join-gym.action"
import { listGyms } from "@/features/gym/components/list-gyms/list-gyms.query"
import { ListGymsView } from "@/features/gym/components/list-gyms/list-gyms.view"

function GymsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <ListGymsView query={listGyms} joinAction={joinGym} />
    </div>
  )
}

export default withAuthentication(GymsPage)
