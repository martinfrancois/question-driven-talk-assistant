/**
 * Format time based on 24h/12h preference.
 *
 * @param now - The date to format.
 * @param use24h - Whether to use 24-hour format.
 * @returns The formatted time string.
 */
export function formatTime(now: Date, use24h: boolean): string {
  return use24h
    ? now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
}
