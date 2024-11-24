import { Page, Locator } from "@playwright/test";
import { AppPage } from "./AppPage";

export class HelpModalPage extends AppPage {
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly restartTourButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.getByTestId("help-modal");
    this.closeButton = page.getByTestId("help-modal-close");
    this.restartTourButton = page
      .getByTestId("restart-tour")
      .locator("visible=true");
  }

  async open(withShortcut: boolean): Promise<void> {
    await super.goto();
    await this.openHelp(withShortcut);
  }

  async close(withShortcut: boolean): Promise<void> {
    if (withShortcut) {
      await this.press("Escape");
    } else {
      await this.closeButton.click();
    }
  }

  async restartTour(): Promise<void> {
    await this.restartTourButton.click();
  }
}
