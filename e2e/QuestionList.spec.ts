import { expect, test } from "@playwright/test";
import { QuestionListPage } from "./pageobjects/QuestionListPage";
import { QuestionItemPage } from "./pageobjects/QuestionItemPage";
import { Question } from "../src/components/QuestionItem";

test.describe("QuestionList e2e tests", () => {
  let questionListPage: QuestionListPage;

  test.beforeEach(async ({ page }) => {
    questionListPage = new QuestionListPage(page);
    await questionListPage.goto();
  });

  test("should contain all question items present in localStorage", async ({
    page,
  }) => {
    // when
    const preloadedQuestions = await questionListPage.preloadQuestionData();

    // then
    await questionListPage.verifyItemCount(preloadedQuestions.length);
    for (const preloadedQuestion of preloadedQuestions) {
      const questionItem = new QuestionItemPage(page, preloadedQuestion.id);
      await questionItem.verifyVisible();
      await questionItem.expectText(preloadedQuestion.text);
      await questionItem.expectAnswered(preloadedQuestion.answered);
      await questionItem.expectHighlighted(preloadedQuestion.highlighted);
    }
  });

  test("should contain one empty question item by default", async () => {
    await questionListPage.isInitialState();
  });

  test("should be able to drag and drop questions down in QuestionList", async () => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();

    // when
    await questionListPage.dragAndDropQuestion(
      questionsBefore[0],
      questionsBefore[1],
    );

    // then
    await verifyOrderChanged(questionsBefore);
  });

  test("should be able to drag and drop questions up in QuestionList", async () => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();

    // when
    await questionListPage.dragAndDropQuestion(
      questionsBefore[1],
      questionsBefore[0],
    );

    // then
    await verifyOrderChanged(questionsBefore);
  });

  test("should be able to reorder question down in QuestionList with keyboard shortcuts", async ({
    page,
  }) => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();
    const questionItemPage = new QuestionItemPage(page, questionsBefore[0].id);

    // when
    await questionItemPage.textarea.press("Control+Shift+ArrowDown");

    // then
    await verifyOrderChanged(questionsBefore);
  });

  test("should be able to reorder question up in QuestionList with keyboard shortcuts", async ({
    page,
  }) => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();
    const questionItemPage = new QuestionItemPage(page, questionsBefore[1].id);

    // when
    await questionItemPage.textarea.press("Control+Shift+ArrowUp");

    // then
    await verifyOrderChanged(questionsBefore);
  });

  test("should NOT be able to reorder the first question UP in QuestionList with keyboard shortcuts", async ({
    page,
  }) => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();
    const questionItemPage = new QuestionItemPage(page, questionsBefore[0].id);

    // when
    await questionItemPage.textarea.press("Control+Shift+ArrowUp");

    // then
    await questionListPage.expectEqualQuestionTexts(questionsBefore);
  });

  test("should NOT be able to reorder the last question DOWN in QuestionList with keyboard shortcuts", async ({
    page,
  }) => {
    // given
    const questionsBefore = await questionListPage.preloadQuestionData();
    const questionItemPage = new QuestionItemPage(page, questionsBefore[2].id);

    // when
    await questionItemPage.textarea.press("Control+Shift+ArrowDown");

    // then
    await questionListPage.expectEqualQuestionTexts(questionsBefore);
  });

  async function verifyOrderChanged(questionsBefore: Question[]) {
    const questionsAfter = await questionListPage.getQuestions();
    expect(questionsAfter[0]).toEqual(questionsBefore[1]);
    expect(questionsAfter[1]).toEqual(questionsBefore[0]);
    const questionItems = await questionListPage.questionItems.all();
    await expect(questionItems[0]).toContainText(questionsBefore[1].text);
    await expect(questionItems[1]).toContainText(questionsBefore[0].text);
  }
});
