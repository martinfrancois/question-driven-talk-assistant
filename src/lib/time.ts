/**
 * Format time based on 24h/12h preference.
 *
 * @param now - The date to format.
 * @param use24h - Whether to use 24-hour format.
 * @returns The formatted time string.
 */
export function formatTime(now: Date, use24h: boolean): string {
  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24h,
  });
}

const MS_PER_MINUTE = 60_000;

/**
 * Milliseconds from `now` to the next whole minute.
 *
 * @param now - The moment to measure from, at or after the Unix epoch.
 * @returns A delay in `(0, 60000]` that lands exactly on the next minute.
 */
export function msUntilNextMinute(now: Date = new Date()): number {
  return MS_PER_MINUTE - (now.getTime() % MS_PER_MINUTE);
}
