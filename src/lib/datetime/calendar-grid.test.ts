import { describe, expect, it } from "vitest";
import {
  leadingEmptyCellCountForMonth,
  mondayFirstWeekdayIndex
} from "./calendar-grid";

describe("calendar-grid", () => {
  it("maps Sunday-based indexes to Monday-first", () => {
    expect(mondayFirstWeekdayIndex(0)).toBe(6); // Sunday
    expect(mondayFirstWeekdayIndex(1)).toBe(0); // Monday
    expect(mondayFirstWeekdayIndex(3)).toBe(2); // Wednesday
  });

  it("pads July 2026 so the 1st lands on Wednesday", () => {
    // 2026-07-01 is a Wednesday → two leading empties (Mon, Tue)
    expect(leadingEmptyCellCountForMonth(2026, 6)).toBe(2);
  });
});
