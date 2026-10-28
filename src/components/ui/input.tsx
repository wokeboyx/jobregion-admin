import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
