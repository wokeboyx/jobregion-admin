import { useMemo, useState } from "react"

export type SortDir = "asc" | "desc"
export type Sorters<T> = Record<string, (row: T) => string | number>

/**
 * Everything a big list needs in one place: sorting by column, paging with a rows-per-page choice, and selecting
 * rows for bulk actions. Selection is kept by id across pages and filters; `selectedRows` gives the chosen rows.
 *
 * `rows` should be a stable reference (from `useMemo`), like `usePagination`.
 */
export function useTable<T>(
  rows: T[],
  {
    getId,
    sorters = {},
    initialSort,
    pageSize: initialPageSize = 25,
  }: {
    getId: (row: T) => string
    sorters?: Sorters<T>
    initialSort?: { key: string; dir: SortDir }
    pageSize?: number
  },
) {
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [prevRows, setPrevRows] = useState(rows)

  // New filter results start again from page 1.
  if (rows !== prevRows) {
    setPrevRows(rows)
    setPage(1)
  }

  const sorted = useMemo(() => {
    const by = sort && sorters[sort.key]
    if (!by) return rows
    const dir = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = by(a)
      const y = by(b)
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir
      return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" }) * dir
    })
  }, [rows, sort, sorters])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
  const pageIds = pagedRows.map(getId)

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : undefined))

  const setPageSize = (size: number) => {
    setPageSizeState(size)
    setPage(1)
  }

  const isSelected = (id: string) => selected.has(id)
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someOnPage = !allOnPage && pageIds.some((id) => selected.has(id))
  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s)
      if (allOnPage) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  const selectAll = () => setSelected(new Set(sorted.map(getId)))
  const clearSelection = () => setSelected(new Set())
  const selectedRows = rows.filter((r) => selected.has(getId(r)))

  return {
    sort,
    toggleSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    pagedRows,
    selection: {
      count: selected.size,
      isSelected,
      toggle,
      allOnPage,
      someOnPage,
      togglePage,
      selectAll,
      clear: clearSelection,
      rows: selectedRows,
    },
  }
}
