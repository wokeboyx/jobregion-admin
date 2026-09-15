import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}

export { BackButton }
