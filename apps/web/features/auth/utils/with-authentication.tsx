import "server-only"

import type { FunctionComponent } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/features/auth/components/get-current-user/get-current-user.query"

export function withAuthentication<Props extends object>(
  Component: FunctionComponent<Props>
): FunctionComponent<Props> {
  async function AuthenticatedComponent(props: Props) {
    const currentUser = await getCurrentUser()

    if (currentUser.status !== "success") {
      redirect("/sign-in")
    }

    return <Component {...props} />
  }

  AuthenticatedComponent.displayName = `withAuthentication(${
    Component.displayName ?? Component.name ?? "Component"
  })`

  return AuthenticatedComponent
}
