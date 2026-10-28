import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Matches the web app's Button: 10px radius, near-black for most actions, brand only for the main one, light disabled state.
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:bg-[#dddddd] disabled:text-white disabled:border-transparent [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        brand: "bg-brand text-white hover:bg-brand-dark",
        outline: "border border-foreground bg-card text-foreground hover:bg-muted",
        soft: "bg-muted-strong text-foreground hover:bg-border",
        ghost: "text-foreground hover:bg-muted disabled:bg-transparent disabled:text-muted-foreground",
        destructive: "text-destructive hover:bg-destructive/10 disabled:bg-transparent disabled:text-muted-foreground",
        danger: "bg-destructive text-white hover:brightness-95",
      },
      size: {
        sm: "h-8 px-3 text-body2",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base rounded-md",
        ghost: "h-auto px-2 py-[5px] text-body2 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
