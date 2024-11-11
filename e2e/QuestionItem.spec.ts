import { test, expect } from "@playwright/test";
import { QuestionItemPage } from "./pageobjects/QuestionItemPage";
import { AppPage } from "./pageobjects/AppPage";
import { QuestionListPage } from "./pageobjects/QuestionListPage";
import { Question } from "../src/components/QuestionItem";

test.describe("QuestionItem Component Tests", () => {
  let appPage: AppPage;
  let questionListPage: QuestionListPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
    questionListPage = new QuestionListPage(page);
  });

  test("should delete question when Backspace is pressed on empty single-line question", async () => {
    // given
    const testQuestion: Question = {
      id: "empty-question-id",
      text: "",
      answered: false,
      highlighted: false,
    };
    const testQuestion2: Question = {
      id: "empty-question-id2",
      text: "",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [
      testQuestion,
      testQuestion2,
    ]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion2.id);
    await questionItem.focusTextarea();

    // when
    await questionItem.pressKey("Backspace");

    // then
    await expect(questionItem.questionItem).not.toBeVisible();

    // Verify localStorage is updated
    const updatedQuestions = await appPage.getQuestions();
    expect(updatedQuestions).toHaveLength(1);
    expect(
      updatedQuestions.find((q) => q.id === testQuestion2.id),
    ).toBeUndefined();
  });

  test("should NOT delete question when Backspace is pressed on empty single-line question, with only one item in the list", async () => {
    // given
    const testQuestion: Question = {
      id: "empty-question-id",
      text: "",
      answered: false,
      highlighted: false,
    };
    const testQuestions = [testQuestion];
    await appPage.setLocalStorageData("questions", testQuestions);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();

    // when
    await questionItem.pressKey("Backspace");

    // then
    await expect(questionItem.questionItem).toBeVisible();

    // Verify localStorage is updated
    await questionListPage.expectEqualQuestionTexts(testQuestions);
  });

  test("should NOT delete question when Backspace is pressed at first line of empty multiline question", async () => {
    // given
    const testQuestion: Question = {
      id: "empty-multiline-question-id",
      text: "\n\n",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();
    await questionItem.moveCursorToStart();

    // when
    await questionItem.pressKey("Backspace");

    // then
    await expect(questionItem.questionItem).toBeVisible();

    // Ensure nothing changed
    await questionListPage.expectEqualQuestionTexts([testQuestion]);
  });

  test("should delete single empty line in multiline question when cursor is at the end", async () => {
    // given
    const testQuestion: Question = {
      id: "empty-multiline-question-id",
      text: "\n",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();
    await questionItem.moveCursorToEnd();

    // when
    await questionItem.pressKey("Backspace");

    // then
    await expect(questionItem.questionItem).toBeVisible();

    // Verify that text is now '' instead of '\n'
    const updatedQuestion = (await appPage.getQuestions()).find(
      (q) => q.id === testQuestion.id,
    );
    expect(updatedQuestion?.text).toBe("");
  });

  test("should delete character when Backspace is pressed in the middle of text", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "Line1\nLine2",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();
    await questionItem.setCursorPosition(7); // Position after 'Line1\nL'

    // when
    await questionItem.pressKey("Backspace");

    // then
    await questionItem.expectText("Line1\nine2"); // 'L' deleted
  });

  test("should navigate to next question on ArrowDown at end of text", async () => {
    // given
    const firstQuestion: Question = {
      id: "first-question-id",
      text: "First question\nWith two lines\n",
      answered: false,
      highlighted: false,
    };
    const nextQuestion: Question = {
      id: "next-question-id",
      text: "Next question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [
      firstQuestion,
      nextQuestion,
    ]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, firstQuestion.id);
    const nextQuestionItem = new QuestionItemPage(
      appPage.page,
      nextQuestion.id,
    );

    await questionItem.focusTextarea();
    await questionItem.moveCursorToEnd();

    // when
    await questionItem.pressKey("ArrowDown");

    // then
    await expect(nextQuestionItem.textarea).toBeFocused();

    // Verify cursor is NOT at the beginning of the line
    const selectionStart = await nextQuestionItem.getCursorPosition();
    expect(selectionStart).toBeGreaterThan(0);
  });

  test("should navigate to previous question on ArrowUp at start of multiline question", async () => {
    // given
    const previousQuestion: Question = {
      id: "previous-question-id",
      text: "Previous question",
      answered: false,
      highlighted: false,
    };
    const currentQuestion: Question = {
      id: "current-question-id",
      text: "\n\nCurrent question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [
      previousQuestion,
      currentQuestion,
    ]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, currentQuestion.id);
    const previousQuestionItem = new QuestionItemPage(
      appPage.page,
      previousQuestion.id,
    );

    await questionItem.focusTextarea();
    await questionItem.moveCursorToStart();

    // when
    await questionItem.pressKey("ArrowUp");

    // then
    await expect(previousQuestionItem.textarea).toBeFocused();
  });

  test("should add new question below on Enter key when text is non-empty", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "This is a question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();

    const initialQuestionCount = (await appPage.getQuestions()).length;

    // when
    await questionItem.pressKey("Enter");

    // then
    const updatedQuestions = await appPage.getQuestions();
    expect(updatedQuestions.length).toBe(initialQuestionCount + 1);
    expect(updatedQuestions[1].text).toBe(""); // New question added after current

    // Verify that new question is focused
    const newQuestionId = updatedQuestions[1].id;
    const newQuestionItem = new QuestionItemPage(appPage.page, newQuestionId);
    await expect(newQuestionItem.textarea).toBeFocused();
  });

  test("should add new question when Tab is pressed at last question and text is non-empty", async () => {
    // given
    const testQuestion: Question = {
      id: "last-question-id",
      text: "Some text",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    await questionItem.focusTextarea();

    const initialQuestionCount = (await appPage.getQuestions()).length;

    // when
    await questionItem.pressKey("Tab");

    // then
    const updatedQuestions = await appPage.getQuestions();
    expect(updatedQuestions.length).toBe(initialQuestionCount + 1);
    expect(updatedQuestions[1].text).toBe(""); // New question added

    // Verify that new question is focused
    const newQuestionId = updatedQuestions[1].id;
    const newQuestionItem = new QuestionItemPage(appPage.page, newQuestionId);
    await expect(newQuestionItem.textarea).toBeFocused();
  });

  test("should handle Tab key to move focus to next question", async () => {
    // given
    const firstQuestion: Question = {
      id: "first-question-id",
      text: "First question",
      answered: false,
      highlighted: false,
    };
    const nextQuestion: Question = {
      id: "next-question-id",
      text: "Next question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [
      firstQuestion,
      nextQuestion,
    ]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, firstQuestion.id);
    const nextQuestionItem = new QuestionItemPage(
      appPage.page,
      nextQuestion.id,
    );

    await questionItem.focusTextarea();

    // when
    await questionItem.pressKey("Tab");

    // then
    await expect(nextQuestionItem.textarea).toBeFocused();
  });

  test("should handle Shift+Tab to move focus to previous question", async () => {
    // given
    const previousQuestion: Question = {
      id: "previous-question-id",
      text: "Previous question",
      answered: false,
      highlighted: false,
    };
    const currentQuestion: Question = {
      id: "current-question-id",
      text: "Current question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [
      previousQuestion,
      currentQuestion,
    ]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, currentQuestion.id);
    const previousQuestionItem = new QuestionItemPage(
      appPage.page,
      previousQuestion.id,
    );

    await questionItem.focusTextarea();

    // when
    await questionItem.pressKey("Shift+Tab");

    // then
    await expect(previousQuestionItem.textarea).toBeFocused();
  });

  test("should update localStorage when text content changes", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "Original text",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    const newText = "Updated question text";

    // when
    await questionItem.focusTextarea();
    await questionItem.setText(newText);

    // then
    const updatedQuestion = (await appPage.getQuestions()).find(
      (q) => q.id === testQuestion.id,
    );
    expect(updatedQuestion?.text).toBe(newText);
  });

  test("should persist checkbox status in localStorage when toggled", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "Question text",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);

    // when
    await questionItem.toggleAnswered(); // Highlight
    await questionItem.toggleAnswered(); // Mark as answered

    // then
    const updatedQuestion = (await appPage.getQuestions()).find(
      (q) => q.id === testQuestion.id,
    );
    expect(updatedQuestion?.answered).toBe(true);
    expect(updatedQuestion?.highlighted).toBe(false);
  });

  test("should maintain state after reloading the page", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "Original text",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
    const newText = "Updated question text after reload";

    await questionItem.focusTextarea();
    await questionItem.setText(newText);
    await questionItem.toggleAnswered(); // Highlight
    await questionItem.toggleAnswered(); // Mark as answered

    // when
    await appPage.reload();

    // then
    const reloadedQuestionItem = new QuestionItemPage(
      appPage.page,
      testQuestion.id,
    );
    await reloadedQuestionItem.expectText(newText);
    await reloadedQuestionItem.expectAnswered(true);

    // Verify localStorage reflects changes
    const updatedQuestion = (await appPage.getQuestions()).find(
      (q) => q.id === testQuestion.id,
    );
    expect(updatedQuestion?.text).toBe(newText);
    expect(updatedQuestion?.answered).toBe(true);
  });

  test("should add new question and persist it in localStorage", async () => {
    // given
    const testQuestion: Question = {
      id: "test-question-id",
      text: "This is a new question",
      answered: false,
      highlighted: false,
    };
    await appPage.setLocalStorageData("questions", [testQuestion]);
    await appPage.reload();

    const questionItem = new QuestionItemPage(appPage.page, testQuestion.id);
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
