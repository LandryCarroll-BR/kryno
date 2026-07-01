import "server-only"

import type { FunctionComponent } from "react"
import { redirect } from "next/navigation"
import type { CurrentUserRole } from "@auth/adapters-next/view-models/get-current-user"

import { getCurrentUser } from "@/features/auth/components/get-current-user/get-current-user.query"

type AuthenticationOptions = {
  readonly requiredRole?: CurrentUserRole
  readonly unauthorizedRedirectUrl?: string
}

export function withAuthentication<Props extends object>(
  Component: FunctionComponent<Props>,
  options: AuthenticationOptions = {}
): FunctionComponent<Props> {
  async function AuthenticatedComponent(props: Props) {
    const currentUser = await getCurrentUser()

    if (currentUser.status !== "success") {
      redirect("/sign-in")
    }

    if (
      options.requiredRole !== undefined &&
      currentUser.role !== options.requiredRole
    ) {
      redirect(options.unauthorizedRedirectUrl ?? "/dashboard")
    }

    return <Component {...props} />
  }

  AuthenticatedComponent.displayName = `withAuthentication(${
    Component.displayName ?? Component.name ?? "Component"
  })`

  return AuthenticatedComponent
}
