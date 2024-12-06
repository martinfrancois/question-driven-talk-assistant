import { Page, Locator, expect } from "@playwright/test";
import { AppPage } from "./AppPage";
import { QuestionItemPage } from "./QuestionItemPage";
import { Question } from "@/stores";

export class QuestionListPage extends AppPage {
  readonly questionItems: Locator;

  constructor(page: Page) {
    super(page);
    this.questionItems = page.getByTestId(/^question-item-.*/);
  }

  async dragAndDropQuestion(source: Question, target: Question) {
    const sourcePage = new QuestionItemPage(this.page, source.id);
    const targetPage = new QuestionItemPage(this.page, target.id);
    await sourcePage.expectReorderButtonVisible(false);
    await targetPage.expectReorderButtonVisible(false);

    await sourcePage.reorderButton.hover();
    await sourcePage.expectReorderButtonVisible(true);
    await sourcePage.reorderButton.dragTo(targetPage.reorderButton);
  }

  async verifyItemCount(count: number) {
    expect(await this.questionItems.all()).toHaveLength(count);
  }

  async isInitialState(emptyLocalStorageExpected = false) {
    // in localStorage
    const questions = await this.getQuestions();
    if (emptyLocalStorageExpected) {
      // the persist middleware only stores to localStorage once a change was made
      expect(questions).toHaveLength(0);
    } else {
      expect(questions).toHaveLength(1);
      const question = questions[0];
      expect(question.text).toBe("");
      expect(question.answered).toBeFalsy();
      expect(question.highlighted).toBeFalsy();
    }

    // on page
    const questionItems = await this.questionItems.all();
    expect(questionItems).toHaveLength(1);
    const questionItem = new QuestionItemPage(
      this.page,
      undefined,
      questionItems[0],
    );
    await questionItem.verifyVisible();
    await questionItem.expectText("");
    await questionItem.expectAnswered(false);
    await questionItem.expectHighlighted(false);
  }

  async expectEqualQuestionTexts(expectedQuestions: Question[]) {
    // localStorage
    const questionsLocalStorage = await this.getQuestions();
    expect(questionsLocalStorage).toEqual(expectedQuestions);
    // page
    const questionItems = await this.questionItems.all();
    for (let i = 0; i < questionItems.length; i++) {
      await expect(questionItems[i]).toContainText(expectedQuestions[i].text);
    }
  }
}
