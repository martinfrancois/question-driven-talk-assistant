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

/**
 * Milliseconds from `now` to the next whole minute.
 *
 * A one-minute interval starts counting when the component mounts, so the
 * displayed minute can be up to a minute late. Waiting this long instead makes
 * every update land on `:00` seconds, and recomputing it per tick absorbs any
 * drift along the way.
 *
 * @param now - The moment to measure from.
 * @returns A delay in `(0, 60000]` that lands exactly on the next minute.
 */
export function msUntilNextMinute(now: Date = new Date()): number {
  return 60_000 - (now.getTime() % 60_000);
}
