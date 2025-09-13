import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<any>("zustand/middleware");
  return {
    ...actual,
    persist: (fn: any) => fn,
    devtools: (fn: any) => fn,
  };
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
      Object.keys(m).map((k) => [k, m[k as keyof typeof m]] as const),
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
