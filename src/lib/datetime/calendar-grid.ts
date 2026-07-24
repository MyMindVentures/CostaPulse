/**
 * Monday-first calendar helpers for availability grids.
 * Day indexes: Monday = 0 … Sunday = 6.
 */

export function mondayFirstWeekdayIndex(utcDayOfWeek: number): number {
  return (utcDayOfWeek + 6) % 7;
}

export function leadingEmptyCellCountForMonth(
  year: number,
  monthIndex: number
): number {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  return mondayFirstWeekdayIndex(first.getUTCDay());
}
