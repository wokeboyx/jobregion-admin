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
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
    >
      <Icon className="size-4" />
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
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={Bold} label="Bold" onClick={() => insertWrap("**", "**", "bold text")} />
          <ToolbarButton icon={Italic} label="Italic" onClick={() => insertWrap("*", "*", "italic text")} />
          <ToolbarButton icon={Heading2} label="Heading" onClick={() => insertLinePrefix("## ")} />
          <ToolbarButton icon={List} label="Bullet list" onClick={() => insertLinePrefix("- ")} />
          <ToolbarButton icon={ImageIcon} label="Insert image" onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium",
              mode === "write" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "rounded px-2 py-1 text-xs font-medium",
              mode === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
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
          className="w-full resize-none bg-card p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      ) : (
        <div
          className="min-h-[200px] bg-card p-3 text-sm text-foreground [&_em]:italic [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md [&_li]:mb-1 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
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
