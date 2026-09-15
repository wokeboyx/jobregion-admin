import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus-visible:border-brand-cta disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
