import type { ReactNode } from "react"
import { Badge } from "@packages/ui/components/badge"
import { cn } from "@packages/ui/lib/utils"

const boulderColorBadgeClasses = {
  UNSPECIFIED: "bg-secondary text-secondary-foreground",
  WHITE: "border-neutral-300 bg-white text-neutral-950",
  BLACK: "bg-neutral-950 text-white",
  RED: "bg-red-600 text-white",
  ORANGE: "bg-orange-500 text-white",
  YELLOW: "bg-yellow-300 text-neutral-950",
  GREEN: "bg-green-600 text-white",
  BLUE: "bg-blue-600 text-white",
  PURPLE: "bg-purple-600 text-white",
  PINK: "bg-pink-500 text-white",
  GRAY: "bg-zinc-500 text-white",
} satisfies Record<string, string>

export const boulderColorBadgeClassName = (color: string): string =>
  boulderColorBadgeClasses[color] ?? boulderColorBadgeClasses.UNSPECIFIED

export function BoulderColorBadge({
  color,
  children,
  className,
}: {
  readonly color: string
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(boulderColorBadgeClassName(color), className)}
    >
      {children}
    </Badge>
  )
}
