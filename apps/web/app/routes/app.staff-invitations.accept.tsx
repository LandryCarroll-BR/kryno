import { useActionData, useNavigation, useSearchParams } from "react-router"

import { acceptStaffInvitationAction } from "../../features/auth/accept-staff-invitation/accept-staff-invitation-action"
import { AcceptStaffInvitationForm } from "../../features/auth/accept-staff-invitation/accept-staff-invitation-form"
import { acceptStaffInvitationLoader } from "../../features/auth/accept-staff-invitation/accept-staff-invitation-loader"
import { AcceptStaffInvitationViewModel } from "../../features/auth/accept-staff-invitation/accept-staff-invitation-view-model"

import type { AcceptStaffInvitationAction } from "../../features/auth/accept-staff-invitation/accept-staff-invitation-action"

export const loader = acceptStaffInvitationLoader
export const action = acceptStaffInvitationAction

export default function AcceptStaffInvitation() {
  const actionData = useActionData<AcceptStaffInvitationAction>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const initialToken = AcceptStaffInvitationViewModel.initialToken(
    new URL(`https://kryno.local/?${searchParams.toString()}`)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div className="max-w-md space-y-5">
            <p className="text-sm font-medium text-muted-foreground">Kryno</p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Accept staff invitation
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Confirm the invitation token before adding Staff access to your
                gym account.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-start lg:justify-self-end">
            <AcceptStaffInvitationForm
              actionData={actionData}
              initialToken={initialToken}
              isSubmitting={navigation.state === "submitting"}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
