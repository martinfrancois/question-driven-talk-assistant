import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { cn } from "./utils.ts";

// Prefixed so no generated name collides with a Tailwind utility.
const customClass = fc
  .stringMatching(/^[a-z]{1,8}$/)
  .map((name) => `custom-${name}`);

describe("cn (properties)", () => {
  it("joins non-Tailwind class names in order and drops falsy values", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(customClass, { maxLength: 6 }),
        fc.constantFrom(false, null, undefined, ""),
        (names, falsy) => {
          const withFalsy = names.flatMap((name) => [falsy, name]);

          expect(cn(...withFalsy)).toBe(names.join(" "));
        },
      ),
    );
  });

  it("keeps only the last of two conflicting Tailwind utilities", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 96 }),
        fc.nat({ max: 96 }),
        customClass,
        (first, second, other) => {
          expect(cn(`p-${first}`, other, `p-${second}`)).toBe(
            `${other} p-${second}`,
          );
        },
      ),
    );
  });
});
