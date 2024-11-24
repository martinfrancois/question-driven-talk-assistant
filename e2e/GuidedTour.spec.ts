import { test } from "@playwright/test";
import { GuidedTourPage } from "./pageobjects/GuidedTourPage.ts";
import { steps } from "../src/components/guided-tour-steps.ts";

test.describe("GuidedTour e2e tests", () => {
  let guidedTourPage: GuidedTourPage;

  test.beforeEach(async ({ page }) => {
    guidedTourPage = new GuidedTourPage(page);
    await guidedTourPage.goto();
  });

  test("should show all steps and allow clicking through them", async () => {
    // given
    await guidedTourPage.expectTourCompleted(false);

    // when
    for (const step of steps) {
      await guidedTourPage.expectStepTextVisible(step.content as string);
      await guidedTourPage.next();
    }

    // then
    await guidedTourPage.expectTourCompleted(true);
  });

  test("should allow you to skip the tour", async () => {
    // given
    await guidedTourPage.expectTourCompleted(false);

    // when
    await guidedTourPage.skip();

    // then
    await guidedTourPage.expectTourCompleted(true);
  });

  test("should not show the tour upon refresh when tour is already finished", async () => {
    // given
    await guidedTourPage.setTourCompleted(true);

    // when
    await guidedTourPage.reload();

    // then
    await guidedTourPage.expectTourCompleted(true);
  });
});
