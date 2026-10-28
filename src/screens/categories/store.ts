import { useSyncExternalStore } from "react"

import { ANCHOR_DATE, jobCategories, type JobCategory, type JobSubcategory } from "@/lib/mock-data"

/**
 * Categories are edited on two pages (the list and each category's page), so the changes live here for the session
 * instead of in each page's state: rename a category on its page, go back, and the list shows the new name.
 */
let categories: JobCategory[] = jobCategories
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setCategories(update: (current: JobCategory[]) => JobCategory[]) {
  categories = update(categories)
  listeners.forEach((l) => l())
}

export function useCategories() {
  return useSyncExternalStore(subscribe, () => categories)
}

export function subcategoryJobs(category: JobCategory) {
  return category.subcategories.reduce((n, s) => n + (s.jobCount ?? 0), 0)
}

const touch = (c: JobCategory): JobCategory => ({ ...c, updated: ANCHOR_DATE })

export const categoryActions = {
  add(input: Pick<JobCategory, "name" | "description" | "icon">) {
    const id = `CAT-${Date.now()}`
    setCategories((cs) => [...cs, { ...input, id, jobCount: 0, hidden: false, updated: ANCHOR_DATE, subcategories: [] }])
    return id
  },
  update(id: string, patch: Partial<JobCategory>) {
    setCategories((cs) => cs.map((c) => (c.id === id ? touch({ ...c, ...patch }) : c)))
  },
  setHidden(ids: string[], hidden: boolean) {
    setCategories((cs) => cs.map((c) => (ids.includes(c.id) ? touch({ ...c, hidden }) : c)))
  },
  remove(ids: string[]) {
    setCategories((cs) => cs.filter((c) => !ids.includes(c.id)))
  },
  addSubcategory(categoryId: string, input: Pick<JobSubcategory, "name" | "description">) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id === categoryId
          ? touch({ ...c, subcategories: [...c.subcategories, { ...input, id: `SUB-${Date.now()}`, jobCount: 0 }] })
          : c,
      ),
    )
  },
  updateSubcategories(categoryId: string, ids: string[], patch: Partial<JobSubcategory>) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id === categoryId
          ? touch({ ...c, subcategories: c.subcategories.map((s) => (ids.includes(s.id) ? { ...s, ...patch } : s)) })
          : c,
      ),
    )
  },
  removeSubcategories(categoryId: string, ids: string[]) {
    setCategories((cs) =>
      cs.map((c) => (c.id === categoryId ? touch({ ...c, subcategories: c.subcategories.filter((s) => !ids.includes(s.id)) }) : c)),
    )
  },
}
