import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { format } from "date-fns";
import {
  generateFileName,
  generateMarkdownContent,
  saveFile,
} from "./save-questions.ts";
import type { Question } from "./stores";

interface WindowWithPicker extends Window {
  showSaveFilePicker?: () => Promise<{
    createWritable: () => Promise<{
      write: (data: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
}

const win = window as WindowWithPicker;

/**
 * Property-based tests for save-questions utilities.
 *
 * These tests leverage fast-check to fuzz a wide range of inputs and ensure
 * that our save helpers behave correctly for any arbitrary data.
 */

describe("save-questions fast-check", () => {
  describe("generateFileName", () => {
    it("sanitises arbitrary titles into safe file names", () => {
      fc.assert(
        fc.property(fc.string(), fc.date(), (title, date) => {
          const expectedTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9- ]+/g, "")
            .replace(/\s+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
          const fileDate = format(date, "yyyy-MM-dd");
          const result = generateFileName(title, date);
          expect(result).toBe(`${fileDate}_${expectedTitle}_questions.md`);
          expect(result).toMatch(
            /^\d{4}-\d{2}-\d{2}_[a-z0-9-]*_questions\.md$/,
          );
          expect(result.includes("--")).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("generateMarkdownContent", () => {
    const questionArb = fc.record({
      id: fc.string(),
      text: fc.string(),
      answered: fc.boolean(),
      highlighted: fc.boolean(),
    });

    it("includes every question with the correct checkbox", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          fc.date(),
          fc.array(questionArb, { maxLength: 5 }),
          (title, footer, date, questions) => {
            const result = generateMarkdownContent(
              title,
              footer,
              date,
              questions as Question[],
            );
            const formattedDate = format(date, "do 'of' MMMM yyyy");
            expect(
              result.startsWith(
                `# ${title}\n\n${footer}\n\n${formattedDate}\n\n`,
              ),
            ).toBe(true);
            for (const q of questions) {
              const firstLine = (q.text || "").split("\n")[0];
              const checkbox = q.answered ? "[x]" : "[ ]";
              expect(result).toContain(`- ${checkbox} ${firstLine}`);
            }
          },
        ),
        { numRuns: 50 },
      );
    });

    const multiLineQuestions = fc
      .array(questionArb, { maxLength: 3 })
      .chain((qs) =>
        fc
          .record({
            id: fc.string(),
            text: fc
              .tuple(fc.string(), fc.string())
              .map(([a, b]) => `${a}\n${b}`),
            answered: fc.boolean(),
            highlighted: fc.boolean(),
          })
          .map((ml) => [...qs, ml]),
      );

    it("indents continuation lines for multi-line questions", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          fc.date(),
          multiLineQuestions,
          (title, footer, date, questions) => {
            const result = generateMarkdownContent(
              title,
              footer,
              date,
              questions as Question[],
            );
            for (const q of questions) {
              if (q.text.includes("\n")) {
                const [first, ...rest] = q.text.split("\n");
                const checkbox = q.answered ? "[x]" : "[ ]";
                const expected = [
                  `- ${checkbox} ${first}`,
                  ...rest.map((line) => `      ${line}`),
                ].join("\n");
                expect(result).toContain(expected);
              }
            }
          },
        ),
        { numRuns: 20 },
      );
    });

    it("handles empty question text", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.string(),
          fc.date(),
          fc.boolean(),
          fc.array(questionArb, { maxLength: 3 }),
          (title, footer, date, answered, questions) => {
            const withEmpty = [
              ...questions,
              { id: "empty", text: "", answered, highlighted: false },
            ];
            const result = generateMarkdownContent(
              title,
              footer,
              date,
              withEmpty as Question[],
            );
            const checkbox = answered ? "[x]" : "[ ]";
            expect(result).toContain(`- ${checkbox}`);
          },
        ),
        { numRuns: 20 },
      );
    });
  });

  describe("saveFile", () => {
    it("uses the File System Access API when available", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.string(),
          async (fileName, content) => {
            vi.restoreAllMocks();
            const write = vi.fn();
            const close = vi.fn();
            const createWritable = vi.fn().mockResolvedValue({ write, close });
            win.showSaveFilePicker = vi
              .fn()
              .mockResolvedValue({ createWritable });
            await saveFile(fileName, content);
            expect(win.showSaveFilePicker).toHaveBeenCalled();
            expect(createWritable).toHaveBeenCalled();
            expect(write).toHaveBeenCalledWith(content);
            expect(close).toHaveBeenCalled();
          },
        ),
        { numRuns: 10 },
      );
    });

    it("falls back to anchor download when API is missing", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.string(),
          async (fileName, content) => {
            vi.restoreAllMocks();
            delete win.showSaveFilePicker;
            const click = vi.fn();
            const anchor = {
              href: "",
              download: "",
              click,
            } as unknown as HTMLAnchorElement;
            vi.spyOn(document, "createElement").mockReturnValue(anchor);
            const appendSpy = vi.spyOn(document.body, "appendChild");
            const removeSpy = vi.spyOn(document.body, "removeChild");
            const createUrlSpy = vi
              .spyOn(URL, "createObjectURL")
              .mockReturnValue("blob:1");
            const revokeUrlSpy = vi.spyOn(URL, "revokeObjectURL");
            await saveFile(fileName, content);
            expect(anchor.download).toBe(fileName);
            expect(click).toHaveBeenCalled();
            expect(appendSpy).toHaveBeenCalledWith(anchor);
            expect(removeSpy).toHaveBeenCalledWith(anchor);
            expect(createUrlSpy).toHaveBeenCalled();
            expect(revokeUrlSpy).toHaveBeenCalled();
          },
        ),
        { numRuns: 10 },
      );
    });

    it("logs errors thrown during save", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.string(),
          async (fileName, content) => {
            vi.restoreAllMocks();
            const error = new Error("boom");
            win.showSaveFilePicker = vi.fn().mockRejectedValue(error);
            const errSpy = vi
              .spyOn(console, "error")
              .mockImplementation(() => undefined);
            await saveFile(fileName, content);
            expect(errSpy).toHaveBeenCalledWith("Error saving file:", error);
          },
        ),
        { numRuns: 5 },
      );
    });
  });
});
