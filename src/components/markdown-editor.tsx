import { useRef, useState, type ChangeEvent, type ComponentType } from "react"
import { Bold, Italic, Heading2, List, Image as ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { renderMarkdown } from "@/lib/markdown"

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
    >
      <Icon className="size-[18px]" />
    </button>
  )
}

function MarkdownEditor({
  value,
  onChange,
  rows = 10,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}) {
  const [mode, setMode] = useState<"write" | "preview">("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertWrap = (before: string, after: string, placeholderText: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end) || placeholderText
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + before.length + selected.length + after.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + prefix.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    insertWrap(`![${file.name}](${url})`, "", "")
    e.target.value = ""
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input transition-colors focus-within:border-foreground">
      <div className="flex items-center justify-between border-b border-border bg-card px-2 py-2">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={Bold} label="Bold" onClick={() => insertWrap("**", "**", "bold text")} />
          <ToolbarButton icon={Italic} label="Italic" onClick={() => insertWrap("*", "*", "italic text")} />
          <ToolbarButton icon={Heading2} label="Heading" onClick={() => insertLinePrefix("## ")} />
          <ToolbarButton icon={List} label="Bullet list" onClick={() => insertLinePrefix("- ")} />
          <ToolbarButton icon={ImageIcon} label="Insert image" onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>
        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "h-8 rounded-full px-3.5 text-body2 font-semibold transition-colors",
              mode === "write" ? "bg-foreground text-white" : "text-foreground hover:bg-muted",
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "h-8 rounded-full px-3.5 text-body2 font-semibold transition-colors",
              mode === "preview" ? "bg-foreground text-white" : "text-foreground hover:bg-muted",
            )}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-y bg-card px-5 py-4 text-body1 leading-7 text-foreground outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <div
          className="min-h-[240px] bg-card px-5 py-4 text-body1 leading-7 text-foreground [&_em]:italic [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl [&_li]:mb-1 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{
            __html:
              renderMarkdown(value) || '<p class="text-muted-foreground">Nothing to preview yet.</p>',
          }}
        />
      )}
    </div>
  )
}

export { MarkdownEditor }
