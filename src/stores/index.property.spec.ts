import { describe, it, expect } from "vitest";
import fc from "fast-check";
import * as indexModule from "./index.ts";
import * as layout from "./layout.ts";
import * as onboarding from "./onboarding.ts";
import * as preferences from "./preferences.ts";
import * as qrCode from "./qr-code.ts";
import * as questions from "./questions.ts";
import * as storageNames from "./storage-names.ts";

describe("stores index re-exports (properties)", () => {
  it("re-exports all symbols from submodules", () => {
    const modules = [
      storageNames,
      layout,
      onboarding,
      preferences,
      qrCode,
      questions,
    ];

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
