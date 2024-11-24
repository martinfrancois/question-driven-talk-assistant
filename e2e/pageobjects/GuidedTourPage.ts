import { expect, Locator, Page } from "@playwright/test";
import { AppPage } from "./AppPage.ts";

export class GuidedTourPage extends AppPage {
  readonly nextButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nextButton = page.locator('button[data-test-id="button-primary"]');
    this.skipButton = page.locator('button[data-test-id="button-skip"]');
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
