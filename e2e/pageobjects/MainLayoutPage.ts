import { Page, Locator } from "@playwright/test";
import { AppPage } from "./AppPage";

export class MainLayoutPage extends AppPage {
  readonly container: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly fullscreenQRCode: Locator;
  readonly timeDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId("main-layout-container");
    this.header = page.getByTestId("main-header");
    this.footer = page.getByTestId("main-footer");
    this.fullscreenQRCode = page.getByTestId("fullscreen-qr-code");
    this.timeDisplay = page.getByTestId("time-display");
  }

  async editHeader(newTitle: string) {
    this.page.on("dialog", (dialog) => dialog.accept(newTitle));
    await this.header.click();
  }

  async editFooter(newFooter: string) {
    this.page.on("dialog", (dialog) => dialog.accept(newFooter));
    await this.footer.click();
  }

  async toggleTimeFormat() {
    await this.timeDisplay.click();
  }

  async toggleFullscreenQRCode() {
    await this.container.press("Control+q");
  }
}
