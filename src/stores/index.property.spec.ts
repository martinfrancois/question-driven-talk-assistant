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

describe("stores index re-exports (properties)", () => {
  it("re-exports all symbols from submodules", async () => {
    const indexModule = await import("./index.ts");

    const modules = await Promise.all([
      import("./storage-names.ts"),
      import("./layout.ts"),
      import("./onboarding.ts"),
      import("./preferences.ts"),
      import("./qr-code.ts"),
      import("./questions.ts"),
    ]);

    const entries = modules.flatMap((m) =>
      Object.keys(m).map(
        (k) => [k, (m as Record<string, unknown>)[k]] as const,
      ),
    );

    expect(entries.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...entries), ([key, value]) => {
        return (
          key in indexModule &&
          indexModule[key as keyof typeof indexModule] === value
        );
      }),
    );
  });
});
