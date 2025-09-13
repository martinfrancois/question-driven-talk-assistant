import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { formatTime } from "./time.ts";

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
