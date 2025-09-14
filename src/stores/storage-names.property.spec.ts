import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

describe("StorageName enum (properties)", () => {
  it("has unique, non-empty, '-storage' suffixed values", async () => {
    const { StorageName } = await import("./storage-names.ts");

    const values = Object.values(StorageName) as string[];

    expect(values.length).toBeGreaterThan(0);
    expect(new Set(values).size).toBe(values.length);

    fc.assert(
      fc.property(
        fc.constantFrom(...values),
        (v: string) => v.length > 0 && v.endsWith("-storage"),
      ),
    );
  });
});
