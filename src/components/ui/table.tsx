import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto bg-card">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("border-b border-border", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("divide-y divide-border", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("transition-colors hover:bg-muted", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-3 text-left align-middle text-xs font-semibold text-muted-foreground first:pl-6 last:pr-6",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-3 align-middle text-sm text-muted-foreground first:pl-6 last:pr-6",
        className,
      )}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
