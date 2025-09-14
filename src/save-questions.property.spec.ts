import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import {
  generateFileName,
  generateMarkdownContent,
  saveFile,
} from "./save-questions.ts";
import type { Question } from "./stores";

describe("generateFileName (properties)", () => {
  it("creates sanitized file names for any title and date", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 0, max: Date.parse("2100-12-31") }),
        (title, ms) => {
          const date = new Date(ms);
          const result = generateFileName(title, date);
          const parts = result.split("_");

          expect(parts).toHaveLength(3);
          const [datePart, formattedTitle, suffix] = parts;
          expect(suffix).toBe("questions.md");
          expect(/^\d{4}-\d{2}-\d{2}$/.test(datePart)).toBe(true);
          // only lowercase letters, digits and dashes allowed
          expect(/^[a-z0-9-]*$/.test(formattedTitle)).toBe(true);
        },
      ),
    );
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

  it("formats multiline question text with indentation and preserves breaks", () => {
    const date = new Date(2023, 0, 1);
    const q: Question = {
      id: "1",
      text: "line1\nline2\nline3",
      answered: false,
      highlighted: false,
    };
    const md = generateMarkdownContent("T", "F", date, [q]);
    const lines = md.split("\n");
    const itemLines = lines.filter(
      (l) => l.startsWith("- [ ") || l.startsWith("      "),
    );
    expect(itemLines[0]).toBe("- [ ] line1  ");
    expect(itemLines[1]).toBe("      line2  ");
    expect(itemLines[2]).toBe("      line3");
  });
});

describe("saveFile (properties)", () => {
  it("uses File System Access API when available", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), fc.string(), async (fileName, content) => {
        const writable = {
          write: vi
            .fn<(content: string) => Promise<void>>()
            .mockResolvedValue(undefined),
          close: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
        };
        const handle = {
          createWritable: vi
            .fn<() => Promise<typeof writable>>()
            .mockResolvedValue(writable),
        };
        const showSave = vi
          .fn<() => Promise<typeof handle>>()
          .mockResolvedValue(handle);
        const win = window as unknown as {
          showSaveFilePicker?: () => Promise<typeof handle>;
        };
        win.showSaveFilePicker = showSave;
        await saveFile(fileName, content);
        expect(showSave).toHaveBeenCalled();
        expect(writable.write).toHaveBeenCalledWith(content);
        expect(writable.close).toHaveBeenCalled();
        delete win.showSaveFilePicker;
      }),
    );
  });

  it("falls back to anchor download when API not available", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), fc.string(), async (fileName, content) => {
        const anchor = document.createElement("a");
        const clickSpy = vi.spyOn(anchor, "click");
        const createSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(anchor);
        const appendSpy = vi.spyOn(document.body, "appendChild");
        const removeSpy = vi.spyOn(document.body, "removeChild");
        const urlSpy = vi
          .spyOn(URL, "createObjectURL")
          .mockReturnValue("blob:fake");
        const revokeSpy = vi
          .spyOn(URL, "revokeObjectURL")
          .mockImplementation(() => undefined);

        const win = window as unknown as { showSaveFilePicker?: unknown };
        delete win.showSaveFilePicker;
        await saveFile(fileName, content);
        expect(clickSpy).toHaveBeenCalled();
        expect(urlSpy).toHaveBeenCalled();
        expect(revokeSpy).toHaveBeenCalled();

        createSpy.mockRestore();
        appendSpy.mockRestore();
        removeSpy.mockRestore();
        urlSpy.mockRestore();
        revokeSpy.mockRestore();
      }),
    );
  });

  it("logs error when saveFile fails", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), fc.string(), async (fileName, content) => {
        const errSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
        const win = window as unknown as {
          showSaveFilePicker?: () => Promise<never>;
        };
        win.showSaveFilePicker = vi
          .fn<() => Promise<never>>()
          .mockRejectedValue(new Error("fail"));
        await saveFile(fileName, content);
        expect(errSpy).toHaveBeenCalled();
        delete win.showSaveFilePicker;
        errSpy.mockRestore();
      }),
    );
  });
});
