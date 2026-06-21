"use client"

import { SignOutViewModel } from "@auth/adapters-next"
import { Button } from "@packages/ui/components/button"

export function SignOutView({
  action,
  redirectUrl,
}: {
  action: (redirectUrl: string | undefined) => Promise<SignOutViewModel>
  redirectUrl?: string
}) {
  return <Button onClick={() => action(redirectUrl)}>Sign Out</Button>
}
