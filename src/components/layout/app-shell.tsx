import { Outlet } from "react-router-dom"

import { PreviewStateProvider } from "@/lib/preview-state"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

function AppShell() {
  return (
    <PreviewStateProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="h-px w-full shrink-0 bg-border" />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </PreviewStateProvider>
  )
}

export { AppShell }
