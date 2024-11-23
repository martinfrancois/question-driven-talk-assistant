import { test, expect } from "@playwright/test";
import { HelpModalPage } from "./pageobjects/HelpModalPage.ts";

test.describe("HelpModal e2e tests", () => {
  let helpModalPage: HelpModalPage;

  test.beforeEach(async ({ page }) => {
    helpModalPage = new HelpModalPage(page);
  });

  const testCases = [
    {
      description: "using shortcuts",
      useShortcuts: true,
    },
    {
      description: "by clicking UI elements",
      useShortcuts: false,
    },
  ];

  // Iterate over each test case and create a test for it
  testCases.forEach(({ description, useShortcuts }) => {
    test(`should open and close help ${description}`, async () => {
      // when
      await helpModalPage.open(useShortcuts);

      // then
      await expect(helpModalPage.modal).toBeVisible();

      // when
      await helpModalPage.close(useShortcuts);

      // then
      await expect(helpModalPage.modal).toBeHidden();
    });
  });
});
