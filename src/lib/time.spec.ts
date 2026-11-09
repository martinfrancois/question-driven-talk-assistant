import { describe, it, expect } from "vitest";
import { msUntilNextMinute } from "./time.ts";

describe("msUntilNextMinute", () => {
  it.each([
    {
      description: "waits a full minute right on the boundary",
      now: new Date(2023, 4, 15, 12, 34, 0, 0),
      expected: 60_000,
    },
    {
      description: "waits the remaining seconds after one elapsed second",
      now: new Date(2023, 4, 15, 12, 34, 1, 0),
      expected: 59_000,
    },
    {
      description: "waits half a minute at the half-minute mark",
      now: new Date(2023, 4, 15, 12, 34, 30, 0),
      expected: 30_000,
    },
    {
      description: "waits one millisecond just before the boundary",
      now: new Date(2023, 4, 15, 12, 34, 59, 999),
      expected: 1,
    },
  ])("$description", ({ now, expected }) => {
    expect(msUntilNextMinute(now)).toBe(expected);
  });

  it("measures from now by default", () => {
    const delay = msUntilNextMinute();

    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThanOrEqual(60_000);
  });
});
