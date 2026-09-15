import { useRef, useState, type ChangeEvent } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Upload } from "lucide-react"

import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MarkdownEditor } from "@/components/markdown-editor"
import { blogPosts, BLOG_CATEGORIES } from "@/lib/mock-data"

const AUTHORS = ["Chiamaka Obi", "Aisha Bello", "Grace Nwankwo"]

function BlogEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"
  const existingPost = isNew ? undefined : blogPosts.find((p) => p.id === id)

  const [title, setTitle] = useState(existingPost?.title ?? "")
  const [author, setAuthor] = useState(existingPost?.author ?? AUTHORS[0])
  const [category, setCategory] = useState(existingPost?.category ?? BLOG_CATEGORIES[0])
  const [body, setBody] = useState(existingPost?.body ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(existingPost?.coverImageUrl)
  const [status, setStatus] = useState(existingPost?.status ?? "warning")
  const [statusLabel, setStatusLabel] = useState(existingPost?.statusLabel ?? "Draft")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [draftId] = useState(() => `BP-${Date.now()}`)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isNew && !existingPost) {
    return (
      <div>
        <BackButton to="/blog" label="Back to Blog" />
        <p className="text-sm text-muted-foreground">Post not found.</p>
      </div>
    )
  }

  const isPublished = statusLabel === "Published"

  const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImageUrl(URL.createObjectURL(file))
  }

  const persist = (nextStatus: typeof status, nextStatusLabel: string) => {
    if (isNew) {
      blogPosts.push({
        id: draftId,
        title,
        author,
        category,
        body,
        coverImageUrl,
        status: nextStatus,
        statusLabel: nextStatusLabel,
        tags: [],
        date: nextStatusLabel === "Published" ? new Date().toISOString().slice(0, 10) : "Not scheduled",
        views: 0,
        cover: "from-stone-300 to-stone-200",
      })
    } else if (existingPost) {
      Object.assign(existingPost, {
        title,
        author,
        category,
        body,
        coverImageUrl,
        status: nextStatus,
        statusLabel: nextStatusLabel,
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton to="/blog" label="Back to Blog" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground">{isNew ? "New post" : "Edit post"}</p>
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

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Cover image</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted"
          >
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <Upload className="size-5" />
                <span className="text-xs">Click to upload a cover image</span>
              </span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground">Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-brand-cta"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground">Category</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-brand-cta"
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground">Author</p>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-brand-cta"
            >
              {AUTHORS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Body</p>
          <MarkdownEditor value={body} onChange={setBody} placeholder="Write the post in Markdown…" />
        </div>

        {!isNew && existingPost && existingPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {existingPost.tags.map((t) => (
              <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => {
              persist(status, statusLabel)
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
              if (isNew) navigate(`/blog`)
            }}
          >
            {isNew ? "Create draft" : "Save changes"}
          </Button>
          {!isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("success")
                setStatusLabel("Published")
                persist("success", "Published")
                if (isNew) navigate("/blog")
              }}
            >
              Publish
            </Button>
          )}
          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("neutral")
                setStatusLabel("Archived")
                persist("neutral", "Archived")
              }}
            >
              Unpublish
            </Button>
          )}
          {saved && <span className="text-xs text-muted-foreground">Saved.</span>}
        </div>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        tone="destructive"
        title="Delete this post?"
        description="This permanently removes the post and cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          const index = blogPosts.findIndex((p) => p.id === existingPost?.id)
          if (index !== -1) blogPosts.splice(index, 1)
          navigate("/blog")
        }}
      />
    </div>
  )
}

export default BlogEditPage
