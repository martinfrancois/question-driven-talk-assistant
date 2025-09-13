import { format } from "date-fns";
import { Question } from "./stores";

/**
 * Generates a standardized file name based on the given title and date.
 *
 * The file name follows the format: `${yyyy-MM-dd}_${formattedTitle}_questions.md`,
 * where `formattedTitle` is the lowercase version of the title with spaces replaced by dashes
 * and all non-alphanumeric characters (except dashes) removed.
 *
 * This implementation avoids the use of regular expressions by iterating through each character
 * of the title to perform the necessary transformations.
 *
 * @param title - The title to include in the file name.
 * @param date - The date to include in the file name, formatted as `yyyy-MM-dd`.
 * @returns A string representing the generated file name, containing only lowercase alphanumerics and dashes.
 *
 * @example
 * ```typescript
 * const fileName = generateFileName("Weekly-Report #1!", new Date(2023, 4, 15));
 * // Returns "2023-05-15_weekly-report-1_questions.md"
 * ```
 */
export const generateFileName = (title: string, date: Date): string => {
  const fileDate = format(date, "yyyy-MM-dd");
  let formattedTitle = "";
  const lowerTitle = title.toLowerCase();

  for (const char of lowerTitle) {
    if (char === " ") {
      // Replace spaces with a single dash, avoiding multiple consecutive dashes
      if (formattedTitle.length === 0 || !formattedTitle.endsWith("-")) {
        formattedTitle += "-";
      }
    } else if (
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === "-"
    ) {
      formattedTitle += char;
    }
    // Ignore any other characters
  }

  // Remove any leading or trailing dashes
  while (formattedTitle.startsWith("-")) {
    formattedTitle = formattedTitle.slice(1);
  }
  while (formattedTitle.endsWith("-")) {
    formattedTitle = formattedTitle.slice(0, -1);
  }

  return `${fileDate}_${formattedTitle}_questions.md`;
};

/**
 * Generates Markdown content for a questions document.
 *
 * The Markdown includes the title, footer, formatted date, and a list of questions with checkboxes
 * indicating whether each question has been answered.
 *
 * @param title - The title of the Markdown document.
 * @param footer - The footer text to include at the end of the document.
 * @param date - The date to include in the document, formatted as `do of MMMM yyyy`.
 * @param questions - An array of `Question` objects to include in the Markdown.
 * @returns A string containing the generated Markdown content.
 *
 * @example
 * ```typescript
 * const markdown = generateMarkdownContent(
 *   "Ask me anything",
 *   "My Footer",
 *   new Date(),
 *   [
 *     { id: "1", text: "What did you do today?", answered: true, highlighted: false },
 *     { id: "2", text: "Any blockers?", answered: false, highlighted: false },
 *   ]
 * );
 * ```
 */
export const generateMarkdownContent = (
  title: string,
  footer: string,
  date: Date,
  questions: Question[],
): string => {
  const formattedDate = format(date, "do 'of' MMMM yyyy");
  let markdownContent = `# ${title}\n\n${footer}\n\n${formattedDate}\n\n`;

  questions.forEach((question) => {
    const questionText = question.text || "";
    const checkbox = question.answered ? "[x]" : "[ ]";

    // Split text into lines and format multiline content
    const lines = questionText.split("\n");
    const formattedLines = lines
      .map((line, index) => {
        const isLastLine = index === lines.length - 1;
        const lineEnding = isLastLine ? "" : "  "; // Add two spaces for line break if not the last line
        if (index === 0) {
          return `- ${checkbox} ${line}${lineEnding}`;
        } else {
          return `      ${line}${lineEnding}`;
        }
      })
      .join("\n");

    markdownContent += `${formattedLines}\n`;
  });

  return markdownContent;
};

/**
 * Saves the provided content to a file with the specified file name.
 *
 * This function attempts to use the File System Access API's `showSaveFilePicker` if available.
 * If the API is not supported by the browser, it falls back to creating a downloadable link.
 *
 * @param fileName - The name of the file to be saved, including the extension (e.g., "questions.md").
 * @param content - The content to write into the file.
 * @returns A promise that resolves when the file has been successfully saved.
 *
 * @example
 * ```typescript
 * await saveFile("questions.md", "# Questions\n- [ ] What is your name?");
 * ```
 */
export const saveFile = async (
  fileName: string,
  content: string,
): Promise<void> => {
  try {
    if ("showSaveFilePicker" in window) {
      // Use File System Access API
      const opts: SaveFilePickerOptions = {
        suggestedName: fileName,
        types: [
          {
            description: "Markdown Files",
            accept: {
              "text/markdown": [".md"],
            },
          },
        ],
      };

      const handle = await window.showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      // Fallback for browsers that do not support showSaveFilePicker
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Error saving file:", err);
  }
};
