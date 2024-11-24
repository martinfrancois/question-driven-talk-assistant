import { expect, Page, test } from "@playwright/test";
import { QuestionItemPage } from "./pageobjects/QuestionItemPage";
import { AppPage } from "./pageobjects/AppPage";
import { QuestionListPage } from "./pageobjects/QuestionListPage";
import { Question } from "../src/components/QuestionItem";

test.describe("QuestionItem e2e tests", () => {
  let appPage: AppPage;
  let questionListPage: QuestionListPage;

  const setupQuestions = async (page: Page, questions: Question[]) => {
    appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setLocalStorageData("questions", questions);
    await appPage.reload();
    questionListPage = new QuestionListPage(page);
  };

  const getQuestionItemPage = (page: Page, questionId: string) => {
    return new QuestionItemPage(page, questionId);
  };

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
    questionListPage = new QuestionListPage(page);
  });

  test.describe("Deletion Tests", () => {
    test("should delete question when Backspace is pressed on empty single-line question", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "empty-question-id",
          text: "",
          answered: false,
          highlighted: false,
        },
        {
          id: "empty-question-id2",
          text: "",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[1].id);
      await questionItemPage.focusTextarea();

      // when
      await questionItemPage.pressKey("Backspace");

      // then
      await expect(questionItemPage.questionItem).not.toBeVisible();

      // Verify localStorage is updated
      const updatedQuestions = await appPage.getQuestions();
      expect(updatedQuestions).toHaveLength(1);
      expect(
        updatedQuestions.find((q) => q.id === testQuestions[1].id),
      ).toBeUndefined();
    });

    test("should NOT delete question when Backspace is pressed on empty single-line question, with only one item in the list", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "empty-question-id",
          text: "",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();

      // when
      await questionItemPage.pressKey("Backspace");

      // then
      await expect(questionItemPage.questionItem).toBeVisible();
      await questionListPage.expectEqualQuestionTexts(testQuestions);
    });

    test("should NOT delete question when Backspace is pressed at first line of empty multiline question", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "empty-multiline-question-id",
          text: "\n\n",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();
      await questionItemPage.moveCursorToStart();

      // when
      await questionItemPage.pressKey("Backspace");

      // then
      await expect(questionItemPage.questionItem).toBeVisible();
      await questionListPage.expectEqualQuestionTexts(testQuestions);
    });

    test("should delete single empty line in multiline question when cursor is at the end", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "empty-multiline-question-id",
          text: "\n",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();
      await questionItemPage.moveCursorToEnd();

      // when
      await questionItemPage.pressKey("Backspace");

      // then
      await expect(questionItemPage.questionItem).toBeVisible();

      // Verify that text is now '' instead of '\n'
      const updatedQuestion = (await appPage.getQuestions()).find(
        (q) => q.id === testQuestions[0].id,
      );
      expect(updatedQuestion?.text).toBe("");
    });

    test("should delete character when Backspace is pressed in the middle of text", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "Line1\nLine2",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();
      await questionItemPage.setCursorPosition(7); // Position after 'Line1\nL'

      // when
      await questionItemPage.pressKey("Backspace");

      // then
      await questionItemPage.expectText("Line1\nine2"); // 'L' deleted
    });
  });

  test.describe("Navigation Tests", () => {
    test("should navigate to next question on ArrowDown at end of text", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "first-question-id",
          text: "First question\nWith two lines\n",
          answered: false,
          highlighted: false,
        },
        {
          id: "next-question-id",
          text: "Next question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const currentQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[0].id,
      );
      const nextQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[1].id,
      );

      await currentQuestionItemPage.focusTextarea();
      await currentQuestionItemPage.moveCursorToEnd();

      // when
      await currentQuestionItemPage.pressKey("ArrowDown");

      // then
      await expect(nextQuestionItemPage.textarea).toBeFocused();

      // Verify cursor is NOT at the beginning of the line
      const selectionStart = await nextQuestionItemPage.getCursorPosition();
      expect(selectionStart).toBeGreaterThan(0);
    });

    test("should navigate to previous question on ArrowUp at start of multiline question", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "previous-question-id",
          text: "Previous question",
          answered: false,
          highlighted: false,
        },
        {
          id: "current-question-id",
          text: "\n\nCurrent question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const currentQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[1].id,
      );
      const previousQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[0].id,
      );

      await currentQuestionItemPage.focusTextarea();
      await currentQuestionItemPage.moveCursorToStart();

      // when
      await currentQuestionItemPage.pressKey("ArrowUp");

      // then
      await expect(previousQuestionItemPage.textarea).toBeFocused();
    });
  });

  test.describe("Adding Questions Tests", () => {
    test("should add new question below on Enter key when text is non-empty", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "This is a question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const initialQuestionCount = (await appPage.getQuestions()).length;
      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();

      // when
      await questionItemPage.pressKey("Enter");

      // then
      const updatedQuestions = await appPage.getQuestions();
      expect(updatedQuestions.length).toBe(initialQuestionCount + 1);
      expect(updatedQuestions[1].text).toBe(""); // New question added after current

      // Verify that new question is focused
      const newQuestionId = updatedQuestions[1].id;
      const newQuestionItemPage = getQuestionItemPage(page, newQuestionId);
      await expect(newQuestionItemPage.textarea).toBeFocused();
    });

    test("should add new question when Tab is pressed at last question and text is non-empty", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "last-question-id",
          text: "Some text",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const initialQuestionCount = (await appPage.getQuestions()).length;
      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);
      await questionItemPage.focusTextarea();

      // when
      await questionItemPage.pressKey("Tab");

      // then
      const updatedQuestions = await appPage.getQuestions();
      expect(updatedQuestions.length).toBe(initialQuestionCount + 1);
      expect(updatedQuestions[1].text).toBe(""); // New question added

      // Verify that new question is focused
      const newQuestionId = updatedQuestions[1].id;
      const newQuestionItemPage = getQuestionItemPage(page, newQuestionId);
      await expect(newQuestionItemPage.textarea).toBeFocused();
    });

    test("should handle Tab key to move focus to next question", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "first-question-id",
          text: "First question",
          answered: false,
          highlighted: false,
        },
        {
          id: "next-question-id",
          text: "Next question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const currentQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[0].id,
      );
      const nextQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[1].id,
      );

      await currentQuestionItemPage.focusTextarea();

      // when
      await currentQuestionItemPage.pressKey("Tab");

      // then
      await expect(nextQuestionItemPage.textarea).toBeFocused();
    });

    test("should handle Shift+Tab to move focus to previous question", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "previous-question-id",
          text: "Previous question",
          answered: false,
          highlighted: false,
        },
        {
          id: "current-question-id",
          text: "Current question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const currentQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[1].id,
      );
      const previousQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[0].id,
      );

      await currentQuestionItemPage.focusTextarea();

      // when
      await currentQuestionItemPage.pressKey("Shift+Tab");

      // then
      await expect(previousQuestionItemPage.textarea).toBeFocused();
    });
  });

  test.describe("State Persistence Tests", () => {
    test("should update localStorage when text content changes", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "Original text",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const newText = "Updated question text";
      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);

      // when
      await questionItemPage.focusTextarea();
      await questionItemPage.setText(newText);

      // then
      const updatedQuestion = (await appPage.getQuestions()).find(
        (q) => q.id === testQuestions[0].id,
      );
      expect(updatedQuestion?.text).toBe(newText);
    });

    test("should persist checkbox status in localStorage when toggled", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "Question text",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);

      // when
      await questionItemPage.toggleAnswered(); // Highlight
      await questionItemPage.toggleAnswered(); // Mark as answered

      // then
      const updatedQuestion = (await appPage.getQuestions()).find(
        (q) => q.id === testQuestions[0].id,
      );
      expect(updatedQuestion?.answered).toBe(true);
      expect(updatedQuestion?.highlighted).toBe(false);
    });

    test("should maintain state after reloading the page", async ({ page }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "Original text",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const newText = "Updated question text after reload";
      const questionItemPage = getQuestionItemPage(page, testQuestions[0].id);

      await questionItemPage.focusTextarea();
      await questionItemPage.setText(newText);
      await questionItemPage.toggleAnswered(); // Highlight
      await questionItemPage.toggleAnswered(); // Mark as answered

      // when
      await appPage.reload();

      // then
      const reloadedQuestionItemPage = getQuestionItemPage(
        page,
        testQuestions[0].id,
      );
      await reloadedQuestionItemPage.expectText(newText);
      await reloadedQuestionItemPage.expectAnswered(true);

      // Verify localStorage reflects changes
      const updatedQuestion = (await appPage.getQuestions()).find(
        (q) => q.id === testQuestions[0].id,
      );
      expect(updatedQuestion?.text).toBe(newText);
      expect(updatedQuestion?.answered).toBe(true);
    });

    test("should add new question and persist it in localStorage", async ({
      page,
    }) => {
      // given
      const testQuestions: Question[] = [
        {
          id: "test-question-id",
          text: "This is a new question",
          answered: false,
          highlighted: false,
        },
      ];
      await setupQuestions(page, testQuestions);

      const questionItem = getQuestionItemPage(page, testQuestions[0].id);
      await questionItem.focusTextarea();

      const initialQuestionCount = (await appPage.getQuestions()).length;

      // when
      await questionItem.pressKey("Enter"); // Add new question

      // then
      const updatedQuestions = await appPage.getQuestions();
      expect(updatedQuestions.length).toBe(initialQuestionCount + 1);
      expect(updatedQuestions[1].text).toBe(""); // New question added and empty
    });
  });
});
