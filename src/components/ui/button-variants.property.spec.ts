import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { buttonVariants } from "./button-variants.ts";

const variants = [
  "default",
  "confirmDanger",
  "outline",
  "confirmSafe",
  "secondary",
  "ghost",
  "link",
] as const;

const sizes = ["default", "sm", "lg", "icon"] as const;

describe("button-variants (properties)", () => {
  it("produces non-empty class strings for allowed variant/size pairs", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...variants),
        fc.constantFrom(...sizes),
        (variant, size) => {
          const cls = buttonVariants({ variant, size });
          expect(typeof cls).toBe("string");
          expect(cls.length).toBeGreaterThan(0);
        },
      ),
    );
  });

  it("falls back to defaultVariants when omitted", () => {
    const cls = buttonVariants({});
    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });
});
