import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

vi.mock("zustand/middleware", async () => {
  const actual =
    await vi.importActual<typeof import("zustand/middleware")>(
      "zustand/middleware",
    );
  return {
    ...actual,
    persist: ((fn: unknown) => fn) as typeof actual.persist,
    devtools: ((fn: unknown) => fn) as typeof actual.devtools,
  } satisfies typeof import("zustand/middleware");
});

describe("StorageName enum (properties)", () => {
  it("has unique, non-empty, '-storage' suffixed values", async () => {
    const { StorageName } = await import("./storage-names.ts");

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
