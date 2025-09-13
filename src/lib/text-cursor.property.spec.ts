import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isMultiLineAndEmptyText,
  totalLines,
  currentLineNumberForCursor,
  positionAtEndOfLine,
} from "./text-cursor.ts";

describe("text-cursor utilities", () => {
  it("totalLines counts newline-separated segments", () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { maxLength: 10 }), (parts) => {
        const text = parts.join("\n");
        expect(totalLines(text)).toBe(Math.max(1, parts.length));
      }),
    );
  });

  it("isMultiLineAndEmptyText true only when >1 lines and all blank", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2, maxLength: 6 }),
        (arr) => {
          const blanks = arr.map(() => "");
          expect(isMultiLineAndEmptyText(blanks.join("\n"))).toBe(true);
        },
      ),
    );
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2, maxLength: 6 }),
        (arr) => {
          const parts = arr.slice();
          parts[0] = "x";
          const text = parts.join("\n");
          expect(isMultiLineAndEmptyText(text)).toBe(false);
        },
      ),
    );
  });

  it("isMultiLineAndEmptyText is false for any single-line text", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !s.includes("\n")),
        (s) => {
          expect(isMultiLineAndEmptyText(s)).toBe(false);
        },
      ),
    );
  });

  it("currentLineNumberForCursor matches manual counting of newlines before cursor", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: -50, max: 250 }),
        (text, pos) => {
          const safeText = text;
          const clamped = Math.max(0, Math.min(pos, safeText.length));
          const expected = (safeText.substring(0, clamped).match(/\n/g) || [])
            .length;
          expect(currentLineNumberForCursor(safeText, pos)).toBe(expected);
        },
      ),
    );
  });

  it("currentLineNumberForCursor counts newlines before cursor", () => {
    expect(currentLineNumberForCursor("a\nb", 2)).toBe(1);
  });

  it("currentLineNumberForCursor returns 0 when no newlines before cursor", () => {
    expect(currentLineNumberForCursor("abc", 2)).toBe(0);
  });

  it("positionAtEndOfLine returns a cursor index within bounds and non-decreasing by line", () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { maxLength: 8 }), (parts) => {
        const text = parts.join("\n");
        let prev = 0;
        for (let i = 0; i < Math.max(1, parts.length); i++) {
          const p = positionAtEndOfLine(text, i);
          expect(p).toBeGreaterThanOrEqual(prev);
          expect(p).toBeLessThanOrEqual(text.length);
          prev = p;
        }
      }),
    );
  });

  it("positionAtEndOfLine clamps line index and handles empty text", () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: -10, max: 100 }), (s, i) => {
        const p = positionAtEndOfLine(s, i);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(s.length);
      }),
    );
  });

  it("positionAtEndOfLine returns full line length on single line", () => {
    expect(positionAtEndOfLine("abc", 0)).toBe(3);
  });
});
