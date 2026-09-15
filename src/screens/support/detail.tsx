import { useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"

import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MarkdownEditor } from "@/components/markdown-editor"
import { supportCategories } from "@/lib/mock-data"

function ArticleEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === "new"

  const categoryId = isNew ? (location.state as { categoryId?: string } | null)?.categoryId : undefined
  const category = isNew
    ? supportCategories.find((c) => c.id === categoryId)
    : supportCategories.find((c) => c.articles.some((a) => a.id === id))
  const existingArticle = isNew ? undefined : category?.articles.find((a) => a.id === id)

  const [title, setTitle] = useState(existingArticle?.title ?? "")
  const [body, setBody] = useState(existingArticle?.body ?? "")
  const [status, setStatus] = useState(existingArticle?.status ?? "warning")
  const [statusLabel, setStatusLabel] = useState(existingArticle?.statusLabel ?? "Draft")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draftId] = useState(() => `SA-${Date.now()}`)

  if (!category || (!isNew && !existingArticle)) {
    return (
      <div>
        <BackButton to="/support" label="Back to Support Center" />
        <p className="text-sm text-muted-foreground">Article not found.</p>
      </div>
    )
  }

  const isPublished = statusLabel === "Published"

  const persist = (nextStatus: typeof status, nextStatusLabel: string) => {
    if (isNew) {
      category.articles.push({
        id: draftId,
        title,
        body,
        status: nextStatus,
        statusLabel: nextStatusLabel,
        updated: new Date().toISOString().slice(0, 10),
        author: "Desmond Ajimuda",
      })
    } else if (existingArticle) {
      Object.assign(existingArticle, { title, body, status: nextStatus, statusLabel: nextStatusLabel })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton to="/support" label="Back to Support Center" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground">{isNew ? "New article" : "Edit article"}</p>
          <StatusPill status={status} label={statusLabel} />
        </div>
        {!isNew && (
          <Button
            variant="destructive"
            size="sm"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        )}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">In {category.name}</p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Title</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-brand-cta"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Body</p>
          <MarkdownEditor value={body} onChange={setBody} placeholder="Write the article in Markdown…" />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => {
              persist(status, statusLabel)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
              if (isNew) navigate("/support")
            }}
          >
            {isNew ? "Create draft" : "Save changes"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextStatus = isPublished ? "warning" : "success"
              const nextStatusLabel = isPublished ? "Draft" : "Published"
              setStatus(nextStatus)
              setStatusLabel(nextStatusLabel)
              persist(nextStatus, nextStatusLabel)
              if (isNew) navigate("/support")
            }}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
          {saved && <span className="text-xs text-muted-foreground">Saved.</span>}
        </div>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        tone="destructive"
        title="Delete this article?"
        description="This permanently removes the article and cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          const index = category.articles.findIndex((a) => a.id === existingArticle?.id)
          if (index !== -1) category.articles.splice(index, 1)
          navigate("/support")
        }}
      />
    </div>
  )
}

export default ArticleEditPage
