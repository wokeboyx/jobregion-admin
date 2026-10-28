/** "6 Jul 2026" */
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}
