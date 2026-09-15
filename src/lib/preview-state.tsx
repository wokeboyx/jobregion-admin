import { createContext, useContext, useState, type ReactNode } from "react"
import { useLocation } from "react-router-dom"

export type PreviewState = "default" | "empty" | "no-results" | "error"

const PreviewStateContext = createContext<{
  state: PreviewState
  setState: (state: PreviewState) => void
}>({ state: "default", setState: () => {} })

export function PreviewStateProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [state, setState] = useState<PreviewState>("default")
  const [trackedPath, setTrackedPath] = useState(pathname)

  if (pathname !== trackedPath) {
    setTrackedPath(pathname)
    setState("default")
  }

  return <PreviewStateContext.Provider value={{ state, setState }}>{children}</PreviewStateContext.Provider>
}

export function usePreviewState() {
  return useContext(PreviewStateContext)
}
