import { useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Status } from "@/components/ui/status-pill"
import { PageHeader } from "@/components/page-header"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { MarkdownEditor } from "@/components/markdown-editor"
import { SelectMenu } from "@/components/ui/select-menu"
import { BLOG_CATEGORIES } from "@/lib/mock-data"
import { BLOG_AUTHORS as AUTHORS, blogStore as blogPosts } from "./generated"

const DOT: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground",
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-body2 font-semibold text-foreground">{label}</p>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <SelectMenu variant="field" value={value} onChange={onChange} options={options} />
}

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-body2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  )
}

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
        <PageHeader title="Post not found" description="This post may have been deleted." back={{ to: "/blog", label: "Back to blog" }} />
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

  const save = () => {
    persist(status, statusLabel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (isNew) navigate("/blog")
  }

  const publish = () => {
    setStatus("success")
    setStatusLabel("Published")
    persist("success", "Published")
    if (isNew) navigate("/blog")
  }

  const unpublish = () => {
    setStatus("neutral")
    setStatusLabel("Archived")
    persist("neutral", "Archived")
  }

  return (
    <div>
      <PageHeader
        title={isNew ? "Write a post" : "Edit post"}
        description={isNew ? "Drafts stay private until you publish them." : undefined}
        back={{ to: "/blog", label: "Back to blog" }}
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_372px] lg:gap-20">
        <div className="min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your post a title"
            aria-label="Title"
            className="heading-page w-full border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-[#b0b0b0]"
          />

          <div className="mt-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-xl border border-input bg-muted transition-colors hover:border-foreground"
            >
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} alt="Cover" className="size-full object-cover" />
                  <span className="absolute bottom-4 right-4 rounded-full bg-card px-4 py-2 text-body2 font-semibold text-foreground shadow-[0_1px_4px_rgb(0_0_0/0.18)]">
                    Change cover
                  </span>
                </>
              ) : (
                <span className="flex flex-col items-center gap-2 text-foreground">
                  <ImagePlus className="size-8" strokeWidth={1.5} />
                  <span className="text-body1 font-semibold underline underline-offset-2">Add a cover photo</span>
                </span>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </div>

          <section className="mt-8 border-t border-border pt-8">
            <h2 className="heading-section">Story</h2>
            <p className="mt-1 text-body2 text-muted-foreground">Write in Markdown. The preview shows how it looks on the website.</p>
            <div className="mt-6">
              <MarkdownEditor value={body} onChange={setBody} rows={16} placeholder="Write the post in Markdown…" />
            </div>
          </section>

          {!isNew && existingPost && existingPost.tags.length > 0 && (
            <section className="mt-8 border-t border-border pt-8">
              <h2 className="heading-section mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {existingPost.tags.map((t) => (
                  <span key={t} className="rounded-full border border-input px-4 py-2 text-body2 font-medium text-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="sticky top-28 rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${DOT[status]}`} />
              <p className="heading-card">{statusLabel}</p>
            </div>
            <p className="mt-1 text-body2 text-muted-foreground">
              {isPublished ? "Live on the website and app." : "Only admins can see this post."}
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Category">
                <Select value={category} onChange={setCategory} options={BLOG_CATEGORIES} />
              </Field>
              <Field label="Author">
                <Select value={author} onChange={setAuthor} options={AUTHORS} />
              </Field>
            </div>

            <div className="mt-6 divide-y divide-border border-y border-border">
              <FactRow label={isPublished ? "Published" : "Scheduled for"}>{existingPost?.date ?? "Not scheduled"}</FactRow>
              <FactRow label="Views">{(existingPost?.views ?? 0).toLocaleString()}</FactRow>
            </div>

            <div className="mt-6 space-y-3">
              {isPublished ? (
                <>
                  <Button size="lg" className="w-full" onClick={save}>
                    Save changes
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={unpublish}>
                    Unpublish
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="w-full" onClick={publish}>
                    Publish
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" onClick={save}>
                    Save draft
                  </Button>
                </>
              )}
              {!isNew && (
                <Button variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}>
                  Delete post
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
