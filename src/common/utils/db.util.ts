/**
 * Turso libSQL returns COUNT(*), SUM(), and numeric columns as BigInt on some builds.
 * This helper safely converts any value to a JS number.
 */
export function toNum(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'bigint') return Number(val);
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}
