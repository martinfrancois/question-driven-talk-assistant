import { expect, Locator, Page } from "@playwright/test";
import { AppPage } from "./AppPage.ts";

export class GuidedTourPage extends AppPage {
  readonly nextButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page) {
    super(page);
    const tourDialog = page.getByRole("alertdialog");
    this.nextButton = tourDialog.getByRole("button", {
      name: /^(Last|Next)$/,
    });
    this.skipButton = tourDialog.getByRole("button", {
      name: "Skip",
      exact: true,
    });
  }

  async goto() {
    await super.goto(false);
  }

  async next() {
    await this.nextButton.click();
  }

  async skip() {
    await this.skipButton.click();
  }

  async expectStepTextVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}
