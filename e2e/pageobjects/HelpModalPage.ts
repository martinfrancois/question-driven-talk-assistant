import { Page, Locator } from "@playwright/test";
import { AppPage } from "./AppPage";

export class HelpModalPage extends AppPage {
  readonly modal: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.getByTestId("help-modal");
    this.closeButton = page.getByTestId("help-modal-close");
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
}
