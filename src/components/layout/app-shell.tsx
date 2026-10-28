import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { PreviewStateProvider } from "@/lib/preview-state"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

/** A white top bar, the navigation in a sidebar on the left, and the page in a centred column beside it. */
function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <PreviewStateProvider>
      <div className="min-h-screen bg-background">
        <Topbar />
        <div className="flex">
          <Sidebar />
          <main className="min-w-0 flex-1 px-10 pb-20 pt-10">
            <div className="mx-auto max-w-[1280px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </PreviewStateProvider>
  )
}

export { AppShell }
