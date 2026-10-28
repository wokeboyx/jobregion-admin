import type { ConnectionType, ImportRules, JobSource, PublishRules, SourceDirection, SyncFrequency } from "@/lib/job-sources"

export const DIRECTIONS: readonly (readonly [SourceDirection, string])[] = [
  ["Import", "Pull jobs in"],
  ["Publish", "Post our jobs out"],
  ["Both", "Both"],
]

export const FREQUENCY_OPTIONS: readonly (readonly [SyncFrequency, string])[] = [
  ["Hourly", "Hourly"],
  ["Every 6 hours", "Every 6 hours"],
  ["Daily", "Daily"],
  ["Manual", "Manual only"],
]

export const MODE_OPTIONS: readonly (readonly [ImportRules["mode"], string])[] = [
  ["review", "Send to review queue"],
  ["auto", "Publish automatically"],
]

export const SCOPE_OPTIONS: readonly (readonly [PublishRules["scope"], string])[] = [
  ["all", "All open jobs"],
  ["promoted", "Promoted jobs only"],
  ["categories", "Chosen categories"],
]

export const EXPIRE_OPTIONS = ["7", "14", "21", "30", "60"].map((d) => ({ value: d, label: `${d} days` }))

export const DIRECTION_TEXT: Record<SourceDirection, string> = {
  Import: "Pulls jobs in",
  Publish: "Posts our jobs out",
  Both: "Pulls jobs in and posts ours out",
}

export function endpointLabel(type: ConnectionType, direction: SourceDirection) {
  if (type === "API") return "API URL"
  if (type === "Feed") return direction === "Publish" ? "Our feed URL (they read it)" : "Feed URL"
  if (type === "Website") return "Website URL"
  return direction === "Publish" ? "Their endpoint URL" : "Our webhook URL (they post to it)"
}

export const scopeText = (r: PublishRules) =>
  r.scope === "categories" ? (r.categories.length ? r.categories.join(", ") : "No categories chosen") : SCOPE_OPTIONS.find((o) => o[0] === r.scope)?.[1]

export const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "source"

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase() || "?"
}

const COLORS = ["#161c24", "#0f766e", "#7c3aed", "#b45309", "#be123c", "#1d4ed8"]
export const colorFor = (name: string) => COLORS[name.length % COLORS.length]

export type NewSource = Pick<JobSource, "name" | "endpoint" | "direction" | "frequency" | "connection"> & { apiKey: string }
