"use client"

import { Button } from "@packages/ui/components/button"

export function SignOutView({
  action,
  redirectUrl,
}: {
  action: (redirectUrl: string | undefined) => Promise<never>
  redirectUrl?: string
}) {
  return <Button onClick={() => action(redirectUrl)}>Sign Out</Button>
}
