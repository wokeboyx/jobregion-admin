import { useState } from "react"

import { FormDialog, FormField } from "@/components/form-dialog"
import { Input } from "@/components/ui/input"
import { IconPicker } from "./icons"
import { textareaClass } from "./options"

export interface CategoryDraft {
  name: string
  description: string
  icon: string
}

/** Add a category: name, a one-line description, and an icon. Mount it fresh each time it opens. */
function AddCategoryDialog({ onClose, onSave }: { onClose: () => void; onSave: (draft: CategoryDraft) => void }) {
  const [draft, setDraft] = useState<CategoryDraft>({ name: "", description: "", icon: "briefcase" })
  const set = (patch: Partial<CategoryDraft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <FormDialog
      open
      onClose={onClose}
      title="Add category"
      description="People pick categories when they post a job. Add subcategories on the category's page next."
      submitLabel="Create category"
      onSubmit={() => {
        if (!draft.name.trim()) return
        onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() })
      }}
    >
      <FormField label="Name">
        <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Home Services" required autoFocus />
      </FormField>
      <FormField label="Description">
        <textarea
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="One line so the team knows what belongs here"
          maxLength={120}
          className={textareaClass}
        />
      </FormField>
      <FormField label="Icon">
        <IconPicker value={draft.icon} onChange={(icon) => set({ icon })} />
      </FormField>
    </FormDialog>
  )
}

export interface SubcategoryDraft {
  name: string
  description: string
}

/** Add or edit a subcategory: name and a one-line description. */
function SubcategoryDialog({
  initial,
  onClose,
  onSave,
}: {
  initial?: SubcategoryDraft
  onClose: () => void
  onSave: (draft: SubcategoryDraft) => void
}) {
  const [draft, setDraft] = useState<SubcategoryDraft>(initial ?? { name: "", description: "" })

  return (
    <FormDialog
      open
      onClose={onClose}
      title={initial ? "Edit subcategory" : "Add subcategory"}
      description={initial ? "Jobs already in this subcategory move with the new name." : "Subcategories help people find the right kind of work."}
      submitLabel={initial ? "Save" : "Add subcategory"}
      onSubmit={() => {
        if (!draft.name.trim()) return
        onSave({ name: draft.name.trim(), description: draft.description.trim() })
      }}
    >
      <FormField label="Name">
        <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Cleaning" required autoFocus />
      </FormField>
      <FormField label="Description">
        <textarea
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          placeholder="One line so the team knows what belongs here"
          maxLength={120}
          className={textareaClass}
        />
      </FormField>
    </FormDialog>
  )
}

export { AddCategoryDialog, SubcategoryDialog }
