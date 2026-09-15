import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderTree, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModuleHeader } from "@/components/module-header"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FormDialog, FormField } from "@/components/form-dialog"
import { EmptyState, ErrorState } from "@/components/page-state"
import { usePreviewState } from "@/lib/preview-state"
import { jobCategories as initialCategories, type JobCategory } from "@/lib/mock-data"

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

function CategoriesPage() {
  const [categories, setCategories] = useState<JobCategory[]>(initialCategories)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(initialCategories.map((c) => [c.id, true])),
  )

  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [draftSubcategories, setDraftSubcategories] = useState<string[]>([""])
  const [editCategory, setEditCategory] = useState<JobCategory | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const [addSubcategoryFor, setAddSubcategoryFor] = useState<string | null>(null)
  const [editSubcategory, setEditSubcategory] = useState<{ categoryId: string; id: string; name: string } | null>(
    null,
  )
  const [deleteSubcategory, setDeleteSubcategory] = useState<{ categoryId: string; id: string } | null>(null)

  const removeCategory = (id: string) => {
    setCategories((cats) => cats.filter((c) => c.id !== id))
  }

  const removeSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories((cats) =>
      cats.map((c) =>
        c.id !== categoryId ? c : { ...c, subcategories: c.subcategories.filter((s) => s.id !== subcategoryId) },
      ),
    )
  }

  const { state: previewState, setState: setPreviewState } = usePreviewState()
  const isEmpty = previewState === "empty" || previewState === "no-results" || categories.length === 0

  return (
    <div>
      <ModuleHeader
        title="Job categories"
        description="Organize the categories and subcategories used to classify job listings."
        action={<Button onClick={() => setAddCategoryOpen(true)}>+ Add category</Button>}
      />

      {previewState === "error" ? (
        <ErrorState onRetry={() => setPreviewState("default")} />
      ) : isEmpty ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create a category to start organizing job listings."
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
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {category.subcategories.length} subcategor{category.subcategories.length === 1 ? "y" : "ies"}
                  </span>
                  <div className="flex items-center gap-1">
                    <GhostAction label="Add subcategory" onClick={() => setAddSubcategoryFor(category.id)} />
                    <GhostAction label="Edit" onClick={() => setEditCategory(category)} />
                    <GhostAction label="Delete" destructive onClick={() => setDeleteCategoryId(category.id)} />
                  </div>
                </div>
              </div>
  
              {expanded[category.id] && (
                <div className="ml-8 space-y-2">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{sub.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <GhostAction
                          label="Edit"
                          onClick={() => setEditSubcategory({ categoryId: category.id, id: sub.id, name: sub.name })}
                        />
                        <GhostAction
                          label="Delete"
                          destructive
                          onClick={() => setDeleteSubcategory({ categoryId: category.id, id: sub.id })}
                        />
                      </div>
                    </div>
                  ))}
  
                  {category.subcategories.length === 0 && (
                    <div className="flex h-12 items-center justify-between rounded-xl border border-dashed border-muted-foreground p-4">
                      <p className="text-[13px] text-muted-foreground">No subcategories yet.</p>
                      <button
                        type="button"
                        onClick={() => setAddSubcategoryFor(category.id)}
                        className="text-xs font-bold text-foreground"
                      >
                        Add subcategory
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <FormDialog
        open={addCategoryOpen}
        onClose={() => {
          setAddCategoryOpen(false)
          setDraftSubcategories([""])
        }}
        title="Add category"
        description="Create a new top-level category and optionally add its subcategories now."
        submitLabel="Create category"
        onSubmit={() => {
          const input = document.getElementById("new-category-name") as HTMLInputElement | null
          const name = input?.value.trim()
          if (!name) return
          const id = `CAT-${Date.now()}`
          const subcategories = draftSubcategories
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s, i) => ({ id: `SUB-${Date.now()}-${i}`, name: s }))
          setCategories((cats) => [...cats, { id, name, subcategories }])
          setExpanded((e) => ({ ...e, [id]: true }))
          setDraftSubcategories([""])
        }}
      >
        <FormField label="Category name">
          <input
            id="new-category-name"
            placeholder="e.g. Home Services"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>

        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-foreground">Subcategories (optional)</p>
          <div className="space-y-2">
            {draftSubcategories.map((value, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  value={value}
                  onChange={(e) =>
                    setDraftSubcategories((subs) => subs.map((s, idx) => (idx === i ? e.target.value : s)))
                  }
                  placeholder={`Subcategory ${i + 1}`}
                  className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
                />
                {draftSubcategories.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove subcategory"
                    onClick={() => setDraftSubcategories((subs) => subs.filter((_, idx) => idx !== i))}
                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDraftSubcategories((subs) => [...subs, ""])}
            className="text-xs font-bold text-foreground"
          >
            + Add another subcategory
          </button>
        </div>
      </FormDialog>

      <FormDialog
        open={editCategory !== null}
        onClose={() => setEditCategory(null)}
        title="Edit category"
        description="Update the category name."
        submitLabel="Save changes"
        onSubmit={() => {
          const input = document.getElementById("edit-category-name") as HTMLInputElement | null
          const name = input?.value.trim()
          if (!name || !editCategory) return
          setCategories((cats) => cats.map((c) => (c.id === editCategory.id ? { ...c, name } : c)))
        }}
      >
        <FormField label="Category name">
          <input
            id="edit-category-name"
            defaultValue={editCategory?.name}
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
      </FormDialog>

      <FormDialog
        open={addSubcategoryFor !== null}
        onClose={() => setAddSubcategoryFor(null)}
        title="Add subcategory"
        description="Create a new subcategory under this category."
        submitLabel="Create subcategory"
        onSubmit={() => {
          const input = document.getElementById("new-subcategory-name") as HTMLInputElement | null
          const name = input?.value.trim()
          if (!name || !addSubcategoryFor) return
          setCategories((cats) =>
            cats.map((c) =>
              c.id !== addSubcategoryFor
                ? c
                : { ...c, subcategories: [...c.subcategories, { id: `SUB-${Date.now()}`, name }] },
            ),
          )
        }}
      >
        <FormField label="Subcategory name">
          <input
            id="new-subcategory-name"
            placeholder="e.g. Cleaning"
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
      </FormDialog>

      <FormDialog
        open={editSubcategory !== null}
        onClose={() => setEditSubcategory(null)}
        title="Edit subcategory"
        description="Update the subcategory name."
        submitLabel="Save changes"
        onSubmit={() => {
          const input = document.getElementById("edit-subcategory-name") as HTMLInputElement | null
          const name = input?.value.trim()
          if (!name || !editSubcategory) return
          setCategories((cats) =>
            cats.map((c) =>
              c.id !== editSubcategory.categoryId
                ? c
                : {
                    ...c,
                    subcategories: c.subcategories.map((s) => (s.id === editSubcategory.id ? { ...s, name } : s)),
                  },
            ),
          )
        }}
      >
        <FormField label="Subcategory name">
          <input
            id="edit-subcategory-name"
            defaultValue={editSubcategory?.name}
            className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-brand-cta"
          />
        </FormField>
      </FormDialog>

      <ConfirmationDialog
        open={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        tone="destructive"
        title="Delete this category?"
        description="Its subcategories will be deleted with it. This cannot be undone."
        confirmLabel="Delete category"
        onConfirm={() => {
          if (deleteCategoryId) removeCategory(deleteCategoryId)
        }}
      />

      <ConfirmationDialog
        open={deleteSubcategory !== null}
        onClose={() => setDeleteSubcategory(null)}
        tone="destructive"
        title="Delete this subcategory?"
        description="This cannot be undone."
        confirmLabel="Delete subcategory"
        onConfirm={() => {
          if (deleteSubcategory) removeSubcategory(deleteSubcategory.categoryId, deleteSubcategory.id)
        }}
      />
    </div>
  )
}

export default CategoriesPage
