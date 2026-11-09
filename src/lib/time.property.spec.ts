import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { formatTime, msUntilNextMinute } from "./time.ts";

describe("msUntilNextMinute (properties)", () => {
  it("always lands exactly on the next minute boundary", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 ** 31 - 1 }), (ms) => {
        const delay = msUntilNextMinute(new Date(ms));

        expect(delay).toBeGreaterThan(0);
        expect(delay).toBeLessThanOrEqual(60_000);
        expect((ms + delay) % 60_000).toBe(0);
      }),
    );
  });

  it("covers the default argument", () => {
    const delay = msUntilNextMinute();

    expect(delay).toBeGreaterThan(0);
    expect(delay).toBeLessThanOrEqual(60_000);
  });
});

describe("formatTime (properties)", () => {
  it("delegates to toLocaleTimeString with hour/minute and hour12 flag", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 ** 31 - 1 }),
        fc.boolean(),
        (ms, use24h) => {
          const date = new Date(ms);
          const spy = vi.spyOn(date, "toLocaleTimeString").mockReturnValue("X");
          const result = formatTime(date, use24h);
          expect(result).toBe("X");
          expect(spy).toHaveBeenCalledWith([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24h,
          });
          spy.mockRestore();
        },
      ),
    );
  });
});
