"use client"

import { Button } from "@packages/ui/components/button"

export function SignOutView({ action }: { action: () => Promise<void> }) {
  return <Button onClick={() => action()}>Sign Out</Button>
}
