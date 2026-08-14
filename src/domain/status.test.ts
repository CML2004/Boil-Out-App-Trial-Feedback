import { describe, expect, it } from "vitest";
import { countFryerStatuses, daysSince, getFryerStatus } from "./status";
import type { Fryer } from "./types";

const fryer = (overrides: Partial<Fryer> = {}): Fryer => ({
  id: "1",
  name: "Pressure Fryer 1",
  type: "Pressure Fryer",
  lastBoilOut: "2026-08-01",
  needsBoilOut: false,
  needsReason: "",
  needsNotes: "",
  history: [],
  ...overrides
});

describe("demo status calculations", () => {
  const now = new Date("2026-08-30T12:00:00");

  it("shows operational, needed, overdue, and manual flag states", () => {
    expect(getFryerStatus(fryer({ lastBoilOut: "2026-08-20" }), { "Pressure Fryer": { neededDays: 22, overdueDays: 28 } }, now)).toBe("ok");
    expect(getFryerStatus(fryer({ lastBoilOut: "2026-08-08" }), { "Pressure Fryer": { neededDays: 22, overdueDays: 28 } }, now)).toBe("needed");
    expect(getFryerStatus(fryer({ lastBoilOut: "2026-08-01" }), { "Pressure Fryer": { neededDays: 22, overdueDays: 28 } }, now)).toBe("overdue");
    expect(getFryerStatus(fryer({ needsBoilOut: true }), { "Pressure Fryer": { neededDays: 22, overdueDays: 28 } }, now)).toBe("needed");
  });

  it("counts dashboard filters", () => {
    expect(countFryerStatuses(["ok", "needed", "overdue", "needed"])).toEqual({ all: 4, ok: 1, needed: 2, overdue: 1 });
  });

  it("calculates elapsed days", () => {
    expect(daysSince("2026-08-20", now)).toBe(10);
  });
});
