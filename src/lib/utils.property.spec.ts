import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { cn } from "./utils.ts";

describe("cn (properties)", () => {
  it("returns a string and merges classnames deterministically", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 6 }),
        fc.array(fc.string(), { maxLength: 6 }),
        (a, b) => {
          const res1 = cn(...a, ...b);
          const res2 = cn(...a, ...b);
          expect(typeof res1).toBe("string");
          expect(res1).toBe(res2);
        },
      ),
    );
  });
});
