import type { Fryer, FryerStatus, FryerTypeRules } from "./types";

export const DEFAULT_TYPE_RULES: FryerTypeRules = {
  "Pressure Fryer": { neededDays: 22, overdueDays: 28 },
  "Open Single Fryer": { neededDays: 22, overdueDays: 28 },
  "Open Double Fryer": { neededDays: 22, overdueDays: 28 }
};

export function daysSince(dateString: string, now = new Date()): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 0;
  const then = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(then.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
}

export function getFryerStatus(fryer: Fryer, typeRules: FryerTypeRules, now = new Date()): FryerStatus {
  if (fryer.needsBoilOut) return "needed";
  const rules = typeRules[fryer.type] ?? DEFAULT_TYPE_RULES["Pressure Fryer"];
  const days = daysSince(fryer.lastBoilOut, now);
  if (days >= rules.overdueDays) return "overdue";
  if (days >= rules.neededDays) return "needed";
  return "ok";
}

export function getStatusSortRank(status: FryerStatus): number {
  if (status === "overdue") return 0;
  if (status === "needed") return 1;
  return 2;
}

export function countFryerStatuses(statuses: FryerStatus[]): Record<"all" | FryerStatus, number> {
  return statuses.reduce<Record<"all" | FryerStatus, number>>((counts, status) => ({
    ...counts,
    all: counts.all + 1,
    [status]: counts[status] + 1
  }), { all: 0, ok: 0, needed: 0, overdue: 0 });
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return "Not recorded";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatShortTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
