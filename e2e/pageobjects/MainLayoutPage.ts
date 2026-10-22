import { Page, Locator } from "@playwright/test";
import { AppPage } from "./AppPage";

export class MainLayoutPage extends AppPage {
  readonly container: Locator;
  readonly header: Locator;
  readonly footer: Locator;
  readonly fullscreenQrCode: Locator;
  readonly timeDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.getByTestId("main-layout-container");
    this.header = page.getByTestId("main-header");
    this.footer = page.getByTestId("main-footer");
    this.fullscreenQrCode = page.getByTestId("fullscreen-qr-code");
    this.timeDisplay = page.getByTestId("time-display");
  }

  async editHeader(newTitle: string): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.accept(newTitle));
    await this.header.click();
  }

  async editHeaderWithKeyboard(newTitle: string, key: string): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.accept(newTitle));
    await this.header.press(key);
  }

  async editFooter(newFooter: string): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.accept(newFooter));
    await this.footer.click();
  }

  async editFooterWithKeyboard(newFooter: string, key: string): Promise<void> {
    this.page.on("dialog", (dialog) => dialog.accept(newFooter));
    await this.footer.press(key);
  }

  async toggleTimeFormat(): Promise<void> {
    await this.timeDisplay.click();
  }

  async toggleFullscreenQrCode(): Promise<void> {
    await this.container.press("Control+q");
  }
}
