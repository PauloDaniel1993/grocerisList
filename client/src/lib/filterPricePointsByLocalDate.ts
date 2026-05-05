import type { PricePoint } from "@/types/priceHistory";

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Start of local calendar day for `YYYY-MM-DD`, or null if invalid or empty. */
function localDayStartMs(ymd: string): number | null {
  const s = ymd.trim();
  if (!s) return null;
  const m = YMD.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d, 0, 0, 0, 0).getTime();
}

/** End of local calendar day for `YYYY-MM-DD`, or null if invalid or empty. */
function localDayEndMs(ymd: string): number | null {
  const s = ymd.trim();
  if (!s) return null;
  const m = YMD.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d, 23, 59, 59, 999).getTime();
}

/** True when `ymd` is a valid calendar date in `YYYY-MM-DD` format. */
function isValidYmd(ymd: string): boolean {
  const m = YMD.exec(ymd.trim());
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d
  );
}

/**
 * Validates a date range for the Dashboard From/To inputs.
 * Returns an error message string, or `null` when the range is valid.
 *
 * - Both empty → valid (show all dates).
 * - Only one field filled → valid as long as the filled value is a valid date.
 * - Both filled → must be valid dates AND `to >= from`.
 */
export function validateDateRange(from: string, to: string): string | null {
  const fromEmpty = from.trim() === "";
  const toEmpty = to.trim() === "";
  const fromValid = fromEmpty || isValidYmd(from);
  const toValid = toEmpty || isValidYmd(to);

  if (!fromValid) return "Invalid From date";
  if (!toValid) return "Invalid To date";

  if (!fromEmpty && !toEmpty) {
    const fromMs = localDayStartMs(from);
    const toMs = localDayStartMs(to);
    if (fromMs !== null && toMs !== null && toMs < fromMs) {
      return "To date must be on or after From date";
    }
  }

  return null;
}

/**
 * When both inputs are blank, returns all points. Otherwise filters by local
 * calendar days (matching `<input type="date">` semantics in the browser).
 */
export function filterPricePointsByLocalDate(
  points: PricePoint[],
  from: string,
  to: string
): PricePoint[] {
  if (!from.trim() && !to.trim()) {
    return points;
  }

  const fromMs = localDayStartMs(from);
  const toMs = localDayEndMs(to);

  return points.filter((p) => {
    const t = new Date(p.date).getTime();
    if (fromMs !== null && t < fromMs) return false;
    if (toMs !== null && t > toMs) return false;
    return true;
  });
}
