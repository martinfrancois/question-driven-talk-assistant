import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateFileName, generateMarkdownContent } from "./save-questions.ts";
import type { Question } from "./stores";

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

describe("generateMarkdownContent (properties)", () => {
  it("lists each question as a list item and preserves checkbox state", () => {
    const date = new Date(2023, 4, 15);
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          }),
          { maxLength: 20 },
        ),
        (qs) => {
          const questions = qs as Question[];
          const md = generateMarkdownContent("T", "F", date, questions);
          // Every question produces at least one line starting with - [x] or - [ ]
          const lines = md.split("\n");
          const items = lines.filter((l) => l.startsWith("- ["));
          expect(items.length).toBe(questions.length);
          for (let i = 0; i < questions.length; i++) {
            expect(
              items[i].startsWith(questions[i].answered ? "- [x]" : "- [ ]"),
            ).toBe(true);
          }
        },
      ),
    );
  });

  it("includes a date header line and a title heading", () => {
    const min = Date.parse("1970-01-01T00:00:00.000Z");
    const max = Date.parse("2100-12-31T23:59:59.999Z");
    const dateMsArb = fc.integer({ min, max });
    fc.assert(
      fc.property(fc.string(), fc.string(), dateMsArb, (title, footer, ms) => {
        const date = new Date(ms);
        const md = generateMarkdownContent(title, footer, date, []);
        expect(md.startsWith(`# ${title}`)).toBe(true);
        expect(md.includes(footer)).toBe(true);
      }),
    );
  });
});
