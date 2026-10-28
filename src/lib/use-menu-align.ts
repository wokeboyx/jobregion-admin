import { useLayoutEffect, useRef, useState } from "react"

const GUTTER = 8

/**
 * Keeps a floating menu inside the viewport. The menu opens on its preferred side; before paint we measure it and, if
 * it spills past the viewport edge, flip it to the other side of its trigger. Without this an absolutely positioned
 * menu near the right edge widens the page, which gives a horizontal scrollbar and makes the layout shake.
 */
function useMenuAlign<T extends HTMLElement>(open: boolean, preferred: "left" | "right") {
  const menuRef = useRef<T>(null)
  const [flipped, setFlipped] = useState(false)

  useLayoutEffect(() => {
    if (!open) {
      setFlipped(false)
      return
    }
    const el = menuRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const spillsRight = rect.right > vw - GUTTER
    const spillsLeft = rect.left < GUTTER
    if ((preferred === "left" && spillsRight && !spillsLeft) || (preferred === "right" && spillsLeft && !spillsRight)) {
      setFlipped(true)
    }
  }, [open, preferred])

  const side = flipped ? (preferred === "left" ? "right" : "left") : preferred
  return { menuRef, side } as const
}

export { useMenuAlign }
