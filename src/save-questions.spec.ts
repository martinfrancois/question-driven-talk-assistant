import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  generateFileName,
  generateMarkdownContent,
  saveFile,
} from "./save-questions.ts";
import { Question } from "./stores";

describe("generateFileName", () => {
  const testCases = [
    {
      description:
        "should generate a correct file name with normal title and date",
      title: "Weekly Report #1!",
      date: new Date(2023, 4, 15), // May 15, 2023
      expected: "2023-05-15_weekly-report-1_questions.md",
    },
    {
      description: "should handle titles with multiple consecutive spaces",
      title: "Weekly   Report   #1!",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weekly-report-1_questions.md",
    },
    {
      description:
        "should handle titles starting with spaces and non-alphanumerics",
      title: "  **Weekly Report: About THIS!",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weekly-report-about-this_questions.md",
    },
    {
      description:
        "should handle titles ending with spaces and non-alphanumerics",
      title: "Weekly Report: News#!  ",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weekly-report-news_questions.md",
    },
    {
      description: "should handle titles with existing dashes",
      title: "Weekly-Report-2023",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weekly-report-2023_questions.md",
    },
    {
      description: "should handle titles with no spaces or special characters",
      title: "WeeklyReport2023",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weeklyreport2023_questions.md",
    },
    {
      description: "should handle empty title",
      title: "",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15__questions.md", // Double underscore due to empty formattedTitle
    },
    {
      description:
        "should handle titles with mixed cases and special characters",
      title: "WeEkLy RePoRt! @#2023*()",
      date: new Date(2023, 4, 15),
      expected: "2023-05-15_weekly-report-2023_questions.md",
    },
  ];

  it.each(testCases)("$description", ({ title, date, expected }) => {
    const result = generateFileName(title, date);
    expect(result).toBe(expected);
  });
});

describe("generateMarkdownContent", () => {
  const testCases = [
    {
      description:
        "should generate correct markdown with single-line questions",
      title: "Ask me anything",
      footer: "My Footer",
      date: new Date(2023, 4, 15), // May 15, 2023
      questions: [
        {
          id: "1",
          text: "What did you do today?",
          answered: true,
          highlighted: false,
        },
        { id: "2", text: "Any blockers?", answered: false, highlighted: false },
      ] as Question[],
      expected: `# Ask me anything

My Footer

15th of May 2023

- [x] What did you do today?
- [ ] Any blockers?
`,
    },
    {
      description: "should generate correct markdown with multi-line questions",
      title: "Daily Standup",
      footer: "End of Day",
      date: new Date(2023, 4, 16), // May 16, 2023
      questions: [
        {
          id: "1",
          text: "What did you work on today?\nAny challenges?",
          answered: true,
          highlighted: false,
        },
        {
          id: "2",
          text: "What are your plans for tomorrow?",
          answered: false,
          highlighted: false,
        },
      ] as Question[],
      expected: `# Daily Standup

End of Day

16th of May 2023

- [x] What did you work on today?  
      Any challenges?
- [ ] What are your plans for tomorrow?
`,
    },
    {
      description: "should handle empty questions array",
      title: "Empty Questions",
      footer: "No questions today.",
      date: new Date(2023, 4, 17), // May 17, 2023
      questions: [] as Question[],
      expected: `# Empty Questions

No questions today.

17th of May 2023

`,
    },
    {
      description: "should handle questions with empty text",
      title: "Some Questions",
      footer: "Footer Text",
      date: new Date(2023, 4, 18), // May 18, 2023
      questions: [
        { id: "1", text: "", answered: true, highlighted: false },
        {
          id: "2",
          text: "Second question?",
          answered: false,
          highlighted: false,
        },
      ] as Question[],
      expected: `# Some Questions

Footer Text

18th of May 2023

- [x] 
- [ ] Second question?
`,
    },
    {
      description: "should handle all questions answered",
      title: "All Answered",
      footer: "All done.",
      date: new Date(2023, 4, 19), // May 19, 2023
      questions: [
        { id: "1", text: "Question one?", answered: true, highlighted: false },
        { id: "2", text: "Question two?", answered: true, highlighted: false },
      ] as Question[],
      expected: `# All Answered

All done.

19th of May 2023

- [x] Question one?
- [x] Question two?
`,
    },
    {
      description: "should handle all questions unanswered",
      title: "All Unanswered",
      footer: "Pending answers.",
      date: new Date(2023, 4, 20), // May 20, 2023
      questions: [
        {
          id: "1",
          text: "First question?",
          answered: false,
          highlighted: false,
        },
        {
          id: "2",
          text: "Second question?",
          answered: false,
          highlighted: false,
        },
      ] as Question[],
      expected: `# All Unanswered

Pending answers.

20th of May 2023

- [ ] First question?
- [ ] Second question?
`,
    },
    {
      description:
        "should handle questions with special characters and multiple lines",
      title: "Special Questions",
      footer: "Footer with *markdown*.",
      date: new Date(2023, 4, 21), // May 21, 2023
      questions: [
        {
          id: "1",
          text: "What is your favorite color?\nWhy?",
          answered: true,
          highlighted: false,
        },
        {
          id: "2",
          text: "Explain *TypeScript* features.",
          answered: false,
          highlighted: false,
        },
      ] as Question[],
      expected: `# Special Questions

Footer with *markdown*.

21st of May 2023

- [x] What is your favorite color?  
      Why?
- [ ] Explain *TypeScript* features.
`,
    },
  ];

  it.each(testCases)(
    "$description",
    ({ title, footer, date, questions, expected }) => {
      const result = generateMarkdownContent(title, footer, date, questions);
      expect(result).toBe(expected);
    },
  );
});

/**
 * `saveFile` is exercised against the browser's real `Blob`, `URL` and DOM
 * APIs. Only `window.showSaveFilePicker` is substituted, because the File
 * System Access picker is a native chooser that cannot be driven unattended;
 * the substitute is a real object implementing the API's contract, and the
 * content it receives is asserted on.
 */
describe("saveFile", () => {
  const CONTENT = "# Ask me anything\n\n- [ ] A question?\n";
  const FILE_NAME = "2023-05-15_ask-me-anything_questions.md";

  // `@types/wicg-file-system-access` declares `showSaveFilePicker` as always
  // present; this view of `window` makes it optional so the test can install
  // and remove its own implementation.
  interface OptionalPicker {
    showSaveFilePicker?: typeof window.showSaveFilePicker;
  }

  const testWindow: OptionalPicker = window;

  /**
   * Chromium really implements `showSaveFilePicker`, and it lives on
   * `Window.prototype`, so `saveFile`'s `"showSaveFilePicker" in window` check
   * cannot be defeated by deleting an own property. These helpers find the
   * property wherever it is defined on the prototype chain, hide it, and put it
   * back afterwards.
   */
  interface PropertyHolder {
    owner: object;
    descriptor: PropertyDescriptor;
  }

  const findPicker = (): PropertyHolder | undefined => {
    let owner: object | null = window;
    while (owner) {
      const descriptor = Object.getOwnPropertyDescriptor(
        owner,
        "showSaveFilePicker",
      );
      if (descriptor) return { owner, descriptor };
      owner = Object.getPrototypeOf(owner) as object | null;
    }
    return undefined;
  };

  let hidden: PropertyHolder | undefined;

  const hidePicker = (): void => {
    hidden = findPicker();
    if (hidden) {
      delete (hidden.owner as Record<string, unknown>).showSaveFilePicker;
    }
  };

  const restorePicker = (): void => {
    delete testWindow.showSaveFilePicker;
    if (hidden) {
      Object.defineProperty(
        hidden.owner,
        "showSaveFilePicker",
        hidden.descriptor,
      );
      hidden = undefined;
    }
  };

  afterEach(() => {
    restorePicker();
    vi.restoreAllMocks();
  });

  it("really is backed by a browser that implements the File System Access API", () => {
    expect("showSaveFilePicker" in window).toBe(true);
  });

  describe("with the File System Access API available", () => {
    it("writes the content through the picker's writable stream", async () => {
      const written: string[] = [];
      let closed = false;
      let receivedOptions: SaveFilePickerOptions | undefined;

      testWindow.showSaveFilePicker = (options?: SaveFilePickerOptions) => {
        receivedOptions = options;
        return Promise.resolve({
          createWritable: () =>
            Promise.resolve({
              write: (data: string) => {
                written.push(data);
                return Promise.resolve();
              },
              close: () => {
                closed = true;
                return Promise.resolve();
              },
            }),
        } as unknown as FileSystemFileHandle);
      };

      await saveFile(FILE_NAME, CONTENT);

      expect(written).toEqual([CONTENT]);
      expect(closed).toBe(true);
      expect(receivedOptions?.suggestedName).toBe(FILE_NAME);
      expect(receivedOptions?.types).toEqual([
        {
          description: "Markdown Files",
          accept: { "text/markdown": [".md"] },
        },
      ]);
    });

    it("swallows the abort raised when the user dismisses the picker", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const abort = new DOMException(
        "The user aborted a request.",
        "AbortError",
      );
      testWindow.showSaveFilePicker = () => Promise.reject(abort);

      await expect(saveFile(FILE_NAME, CONTENT)).resolves.toBeUndefined();

      expect(consoleError).toHaveBeenCalledWith("Error saving file:", abort);
    });

    it("swallows a failure to open the writable stream", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const failure = new Error("no permission");
      testWindow.showSaveFilePicker = () =>
        Promise.resolve({
          createWritable: () => Promise.reject(failure),
        } as unknown as FileSystemFileHandle);

      await expect(saveFile(FILE_NAME, CONTENT)).resolves.toBeUndefined();

      expect(consoleError).toHaveBeenCalledWith("Error saving file:", failure);
    });
  });

  describe("without the File System Access API", () => {
    beforeEach(() => {
      hidePicker();
      expect("showSaveFilePicker" in window).toBe(false);
    });

    it("falls back to a download link carrying the content as a markdown blob", async () => {
      const blobs: Blob[] = [];
      const created: string[] = [];
      const revoked: string[] = [];
      const clicked: HTMLAnchorElement[] = [];
      const attachedWhileClicked: boolean[] = [];

      const realCreate = URL.createObjectURL.bind(URL);
      vi.spyOn(URL, "createObjectURL").mockImplementation(
        (obj: Blob | MediaSource) => {
          blobs.push(obj as Blob);
          const url = realCreate(obj);
          created.push(url);
          return url;
        },
      );
      const realRevoke = URL.revokeObjectURL.bind(URL);
      vi.spyOn(URL, "revokeObjectURL").mockImplementation((url: string) => {
        revoked.push(url);
        realRevoke(url);
      });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        function (this: HTMLAnchorElement) {
          clicked.push(this);
          attachedWhileClicked.push(document.body.contains(this));
        },
      );

      await saveFile(FILE_NAME, CONTENT);

      expect(clicked).toHaveLength(1);
      expect(clicked[0].download).toBe(FILE_NAME);
      expect(clicked[0].href).toBe(created[0]);
      // The anchor must be in the document at click time, and gone afterwards.
      expect(attachedWhileClicked).toEqual([true]);
      expect(document.body.contains(clicked[0])).toBe(false);

      expect(blobs).toHaveLength(1);
      expect(blobs[0].type).toBe("text/markdown");
      expect(await blobs[0].text()).toBe(CONTENT);

      expect(revoked).toEqual(created);
    });

    it("reports a failure instead of throwing", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const failure = new Error("blob urls unavailable");
      vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
        throw failure;
      });

      await expect(saveFile(FILE_NAME, CONTENT)).resolves.toBeUndefined();

      expect(consoleError).toHaveBeenCalledWith("Error saving file:", failure);
    });
  });
});
