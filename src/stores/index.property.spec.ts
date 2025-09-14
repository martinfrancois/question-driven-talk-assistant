import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

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
