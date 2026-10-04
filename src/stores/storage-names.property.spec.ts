import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { StorageName } from "./storage-names.ts";

describe("StorageName enum (properties)", () => {
  it("has unique, non-empty, '-storage' suffixed values", () => {
    const values = Object.values(StorageName) as string[];

    expect(values.length).toBeGreaterThan(0);
    expect(new Set(values).size).toBe(values.length);

    fc.assert(
      fc.property(
        fc.constantFrom(...values),
        (v) => v.length > 0 && v.endsWith("-storage"),
      ),
    );
  });
});
