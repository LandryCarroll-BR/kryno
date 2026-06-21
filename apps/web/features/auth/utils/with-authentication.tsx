import "server-only"

import type { FunctionComponent } from "react"
import { getCurrentUser } from "@/features/auth/components/current-user/current-user.query"

export function withAuthentication<Props extends object>(
  Component: FunctionComponent<Props>
): FunctionComponent<Props> {
  async function AuthenticatedComponent(props: Props) {
    await getCurrentUser()

    return <Component {...props} />
  }

  AuthenticatedComponent.displayName = `withAuthentication(${
    Component.displayName ?? Component.name ?? "Component"
  })`

  return AuthenticatedComponent
}
