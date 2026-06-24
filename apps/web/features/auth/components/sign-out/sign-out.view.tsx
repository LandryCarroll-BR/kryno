"use client"

import { Button } from "@packages/ui/components/button"
import { signOut } from "@/features/auth/components/sign-out/sign-out.action"

export function SignOutView({ action }: { action: typeof signOut }) {
  return <Button onClick={() => action()}>Sign Out</Button>
}
