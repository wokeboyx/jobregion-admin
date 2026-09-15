import { useState } from "react"

// `rows` must be a stable reference (e.g. from `useMemo`) — a new array literal
// on every render (like `condition ? [] : rows`) makes the reset-on-change check
// below true every render, which is an infinite render loop, not just a missed reset.
export function usePagination<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const [prevRows, setPrevRows] = useState(rows)

  if (rows !== prevRows) {
    setPrevRows(rows)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return { page, setPage, totalPages, pagedRows }
}
