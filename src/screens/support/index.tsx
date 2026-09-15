import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, ChevronDown, Folder, GripVertical, LifeBuoy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusPill } from "@/components/ui/status-pill"
import { Avatar } from "@/components/ui/avatar"
import { ModuleHeader } from "@/components/module-header"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FormDialog, FormField } from "@/components/form-dialog"
import { EmptyState, ErrorState } from "@/components/page-state"
import { usePreviewState } from "@/lib/preview-state"
import { supportCategories as initialCategories, type SupportCategory } from "@/lib/mock-data"

function GhostAction({ label, destructive, onClick }: { label: string; destructive?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1.5 text-[13px] font-bold hover:bg-muted ${
        destructive ? "text-destructive" : "text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function SupportPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<SupportCategory[]>(initialCategories)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(initialCategories.map((c) => [c.id, true])),
  )
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)

  const toggleCategoryActive = (id: string) => {
    setCategories((cats) => cats.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))
  }

  const removeCategory = (id: string) => {
    setCategories((cats) => cats.filter((c) => c.id !== id))
  }

  const togglePublish = (categoryId: string, articleId: string) => {
    setCategories((cats) =>
      cats.map((c) =>
        c.id !== categoryId
          ? c
          : {
              ...c,
              articles: c.articles.map((a) =>
                a.id !== articleId
                  ? a
                  : a.statusLabel === "Published"
                    ? { ...a, status: "warning", statusLabel: "Draft" }
                    : { ...a, status: "success", statusLabel: "Published" },
              ),
            },
      ),
    )
  }

  const removeArticle = (categoryId: string, articleId: string) => {
    setCategories((cats) =>
      cats.map((c) => (c.id !== categoryId ? c : { ...c, articles: c.articles.filter((a) => a.id !== articleId) })),
    )
  }

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const isEmpty = previewState === "empty" || previewState === "no-results" || categories.length === 0

  return (
    <div>
      <ModuleHeader
        title="Support articles"
        description="FAQs and how-tos shown to end users on the JobRegion web and mobile help center."
        action={<Button onClick={() => setAddCategoryOpen(true)}>+ Add category</Button>}
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : isEmpty ? (
        <EmptyState
          icon={LifeBuoy}
          title="No categories yet"
          description="Create a category to start organizing support articles."
          action={<Button onClick={() => setAddCategoryOpen(true)}>+ Add category</Button>}
        />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [category.id]: !e[category.id] }))}
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    {expanded[category.id] ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </button>
                  <Folder className="size-4 text-muted-foreground" />
                  <p className="text-base font-medium text-foreground">{category.name}</p>
                  <StatusPill status={category.active ? "success" : "neutral"} label={category.active ? "Active" : "Inactive"} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {category.articles.length} article{category.articles.length === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-1">
                    <GhostAction
                      label="Add article"
                      onClick={() => navigate("/support/articles/new", { state: { categoryId: category.id } })}
                    />
                    <GhostAction label="Edit" />
                    <GhostAction
                      label={category.active ? "Deactivate" : "Activate"}
                      onClick={() => toggleCategoryActive(category.id)}
                    />
                    <GhostAction
                      label="Delete"
                      destructive
                      onClick={() => setDeleteCategoryId(category.id)}
                    />
                  </div>
                </div>
              </div>
  
              {expanded[category.id] && (
                <div className="ml-8 space-y-2">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/support/articles/${article.id}`)}
                        className="flex items-center gap-2 text-left"
                      >
                        <GripVertical className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground hover:underline">{article.title}</p>
                        <StatusPill status={article.status} label={article.statusLabel} />
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Updated {article.updated}</span>
                        <div className="flex items-center gap-1.5">
                          <Avatar name={article.author} />
                          <span className="text-xs text-muted-foreground">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GhostAction label="Edit" onClick={() => navigate(`/support/articles/${article.id}`)} />
                          <GhostAction
                            label={article.statusLabel === "Draft" ? "Publish" : "Unpublish"}
                            onClick={() => togglePublish(category.id, article.id)}
                          />
                          <GhostAction
                            label="Delete"
                            destructive
                            onClick={() => removeArticle(category.id, article.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
  
                  {category.articles.length === 0 && (
                    <div className="flex h-12 items-center justify-between rounded-xl border border-dashed border-muted-foreground p-4">
                      <p className="text-[13px] text-muted-foreground">No articles yet.</p>
                      <button
                        type="button"
                        onClick={() => navigate("/support/articles/new", { state: { categoryId: category.id } })}
                        className="text-xs font-bold text-foreground"
                      >
                        Add article
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        tone="destructive"
        title="Delete this category?"
        description="Articles in this category will need to be moved first if any remain. This cannot be undone."
        confirmLabel="Delete category"
        onConfirm={() => {
          if (deleteCategoryId) removeCategory(deleteCategoryId)
        }}
      />

      <FormDialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        title="Add category"
        description="Create a new category to group related support articles."
        submitLabel="Create category"
        onSubmit={() => {
          const input = document.getElementById("new-category-name") as HTMLInputElement | null
          const name = input?.value.trim()
          if (!name) return
          const id = `SC-${Date.now()}`
          setCategories((cats) => [...cats, { id, name, active: true, articles: [] }])
          setExpanded((e) => ({ ...e, [id]: true }))
        }}
      >
        <FormField label="Category name">
          <input
            id="new-category-name"
            placeholder="e.g. Billing"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
      </FormDialog>

    </div>
  )
}

export default SupportPage
