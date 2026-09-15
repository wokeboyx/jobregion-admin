import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-md border border-border bg-card", className)}
      {...props}
    />
  )
}

export { Card }
