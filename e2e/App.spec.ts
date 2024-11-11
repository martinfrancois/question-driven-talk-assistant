import { test, expect } from "@playwright/test";
import { AppPage } from "./pageobjects/AppPage";

test.describe("App e2e tests", () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
  });

  test("should have questions when they are preloaded", async () => {
    // when
    const initialQuestions = await appPage.preloadQuestionData();

    // then
    expect(initialQuestions).not.toHaveLength(0);
    const questions = await appPage.getQuestions();
    expect(questions).toEqual(initialQuestions);
  });
});
