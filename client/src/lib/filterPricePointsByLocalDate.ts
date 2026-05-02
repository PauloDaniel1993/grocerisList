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
