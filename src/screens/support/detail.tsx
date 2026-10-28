import { useState, type ReactNode } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import type { Status } from "@/components/ui/status-pill"
import { PageHeader } from "@/components/page-header"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MarkdownEditor } from "@/components/markdown-editor"
import { helpCategories as supportCategories } from "./generated"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-body2">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right text-foreground">{children}</span>
    </div>
  )
}

function ArticleEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === "new"

  const categoryId = isNew ? (location.state as { categoryId?: string } | null)?.categoryId : undefined
  const category = isNew
    ? (supportCategories.find((c) => c.id === categoryId) ?? supportCategories[0])
    : supportCategories.find((c) => c.articles.some((a) => a.id === id))
  const existingArticle = isNew ? undefined : category?.articles.find((a) => a.id === id)

  const [title, setTitle] = useState(existingArticle?.title ?? "")
  const [body, setBody] = useState(existingArticle?.body ?? "")
  const [status, setStatus] = useState(existingArticle?.status ?? "warning")
  const [statusLabel, setStatusLabel] = useState(existingArticle?.statusLabel ?? "Draft")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draftId] = useState(() => `SA-${Date.now()}`)

  const back = { to: "/support", label: "Back to Help Center" }

  if (!category || (!isNew && !existingArticle)) {
    return <PageHeader title="Article not found" description="This article may have been deleted or moved." back={back} />
  }

  const isPublished = statusLabel === "Published"
  const author = existingArticle?.author ?? "Desmond Ajimuda"

  const persist = (nextStatus: typeof status, nextStatusLabel: string) => {
    if (isNew) {
      category.articles.push({
        id: draftId,
        title,
        body,
        status: nextStatus,
        statusLabel: nextStatusLabel,
        updated: new Date().toISOString().slice(0, 10),
        author,
        views: 0,
      })
    } else if (existingArticle) {
      Object.assign(existingArticle, { title, body, status: nextStatus, statusLabel: nextStatusLabel })
    }
  }

  const save = () => {
    persist(status, statusLabel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (isNew) navigate("/support")
  }

  const togglePublish = () => {
    const nextStatus = isPublished ? "warning" : "success"
    const nextStatusLabel = isPublished ? "Draft" : "Published"
    setStatus(nextStatus)
    setStatusLabel(nextStatusLabel)
    persist(nextStatus, nextStatusLabel)
    if (isNew) navigate("/support")
  }

  return (
    <div>
      <PageHeader title={isNew ? "New article" : "Edit article"} description={`In ${category.name}`} back={back} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_372px] lg:gap-20">
        <div className="min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your article a title"
            aria-label="Title"
            className="heading-page w-full border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-[#b0b0b0]"
          />

          <section className="mt-8 border-t border-border pt-8">
            <h2 className="heading-section">Article</h2>
            <p className="mt-1 text-body2 text-muted-foreground">Write in Markdown. Keep each step short so it reads well on a phone.</p>
            <div className="mt-6">
              <MarkdownEditor value={body} onChange={setBody} rows={18} placeholder="Write the article in Markdown…" />
            </div>
          </section>
        </div>

        <aside>
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${DOT[status]}`} />
              <p className="heading-card">{statusLabel}</p>
            </div>
            <p className="mt-1 text-body2 text-muted-foreground">
              {isPublished ? "Live in the Help Center on web and mobile." : "Only admins can see this article."}
            </p>

            <div className="mt-6 divide-y divide-border border-y border-border">
              <FactRow label="Category">{category.name}</FactRow>
              <FactRow label="Last updated">{existingArticle?.updated ?? "Not saved yet"}</FactRow>
              <FactRow label="Views">{(existingArticle?.views ?? 0).toLocaleString()}</FactRow>
              <FactRow label="Author">
                <Avatar name={author} className="size-6" />
                {author}
              </FactRow>
            </div>

            <div className="mt-6 space-y-3">
              {isPublished ? (
                <>
                  <Button size="lg" className="w-full" onClick={save}>
                    Save changes
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={togglePublish}>
                    Unpublish
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="w-full" onClick={togglePublish}>
                    Publish
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={save}>
                    Save draft
                  </Button>
                </>
              )}
              {!isNew && (
                <Button variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}>
                  Delete article
                </Button>
              )}
              {saved && <p className="text-center text-body2 text-muted-foreground">Saved.</p>}
            </div>
          </div>
        </aside>
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
