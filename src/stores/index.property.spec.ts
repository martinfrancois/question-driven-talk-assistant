import { describe, it, expect } from "vitest";
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

    // Every entry, not a random sample: one missing re-export must fail.
    for (const [key, value] of entries) {
      expect(indexModule, key).toHaveProperty(key, value);
    }
  });
});
