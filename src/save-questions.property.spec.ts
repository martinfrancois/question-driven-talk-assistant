import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateFileName } from "./save-questions.ts";

describe("generateFileName", () => {
  it("creates sanitized file names", () => {
    const samples = fc.sample(fc.string(), 100);

    for (const title of ["Hello  World!!", "--Example--", ...samples]) {
      const date = new Date(2020, 0, 1);
      const result = generateFileName(title, date);
      const parts = result.split("_");

      expect(parts).toHaveLength(3);
      const [datePart, formattedTitle, suffix] = parts;
      expect(suffix).toBe("questions.md");
      expect(/\d{4}-\d{2}-\d{2}/.test(datePart)).toBe(true);
      expect(/^[a-z0-9-]*$/.test(formattedTitle)).toBe(true);

      if (formattedTitle.length > 0) {
        expect(formattedTitle.startsWith("-")).toBe(false);
        expect(formattedTitle.endsWith("-")).toBe(false);
        expect(formattedTitle.includes("--")).toBe(false);
      }
    }
  });
});
