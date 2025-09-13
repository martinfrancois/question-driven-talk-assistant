import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  clampQrSize,
  computeResizeDelta,
  MIN_QR_CODE_SIZE,
  MAX_QR_CODE_SIZE,
} from "./qr.ts";

describe("qr utils", () => {
  it("clampQrSize always returns within [MIN, MAX] and is idempotent", () => {
    fc.assert(
      fc.property(fc.integer({ min: -10_000, max: 10_000 }), (n) => {
        const c = clampQrSize(n);
        expect(c).toBeGreaterThanOrEqual(MIN_QR_CODE_SIZE);
        expect(c).toBeLessThanOrEqual(MAX_QR_CODE_SIZE);
        expect(clampQrSize(c)).toBe(c);
      }),
    );
  });

  it("computeResizeDelta matches max-based rule for each direction", () => {
    fc.assert(
      fc.property(
        fc.record({
          direction: fc.constantFrom(
            "bottom-right" as const,
            "bottom-left" as const,
          ),
          dx: fc.integer({ min: -1000, max: 1000 }),
          dy: fc.integer({ min: -1000, max: 1000 }),
        }),
        ({ direction, dx, dy }) => {
          const d = computeResizeDelta(direction, dx, dy);
          const expected =
            direction === "bottom-right" ? Math.max(dx, dy) : Math.max(-dx, dy);
          expect(d).toBe(expected);
        },
      ),
    );
  });
});
