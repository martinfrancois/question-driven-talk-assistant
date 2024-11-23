import { describe, it, expect } from "vitest";
import { generateFileName, generateMarkdownContent } from "./save-questions.ts";
import { Question } from "./components/QuestionItem.tsx";

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
