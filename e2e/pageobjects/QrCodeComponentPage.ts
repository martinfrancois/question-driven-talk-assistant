import { expect, Locator, Page } from "@playwright/test";
import { AppPage } from "./AppPage";
import { MainLayoutPage } from "./MainLayoutPage";
import { StorageName } from "@/stores";

export class QrCodeComponentPage extends AppPage {
  readonly qrCodeButton: Locator; // opens the URL prompt
  readonly qrCodeSvg: Locator; // qr code itself as an SVG
  readonly qrCodePlaceholder: Locator; // placeholder text when URL is empty
  readonly resizeHandleBottomRight: Locator;
  readonly resizeHandleBottomLeft: Locator;

  private mainLayoutPage: MainLayoutPage;

  constructor(page: Page) {
    super(page);
    this.qrCodeButton = page.getByTestId("qr-code");
    this.qrCodeSvg = page.getByTestId("qr-code-svg");
    this.qrCodePlaceholder = page.getByTestId("qr-code-placeholder");
    this.resizeHandleBottomRight = page.getByTestId(
      "qr-code-resize-bottom-right",
    );
    this.resizeHandleBottomLeft = page.getByTestId(
      "qr-code-resize-bottom-left",
    );
    this.mainLayoutPage = new MainLayoutPage(page);
  }

  async setQrCodeURL(url: string) {
    this.page.on("dialog", (dialog) => dialog.accept(url));
    await this.qrCodeButton.click();
  }

  async resizeQrCode(direction: "bottom-right" | "bottom-left") {
    const handle =
      direction === "bottom-right"
        ? this.resizeHandleBottomRight
        : this.resizeHandleBottomLeft;
    await handle.dragTo(this.qrCodeButton, { force: true });
  }

  async hoverOverQrCode() {
    await this.qrCodeButton.hover();
  }

  /** Opens the app with an example QR code URL in localStorage. */
  async gotoWithExampleQrCodeUrl() {
    await this.seedLocalStorage(StorageName.QR_CODE, {
      qrCodeUrl: "https://example.com",
    }); // TODO refactor keys to be defined in an enum or const for reuse
    await this.goto();
  }

  async verifyNoUrl() {
    const qrCodeUrl = await this.getQrCodeUrl();
    expect(qrCodeUrl).toEqual("");

    await expect(this.qrCodeButton).toBeVisible();
    await expect(this.qrCodeSvg).toBeHidden();
    await expect(this.resizeHandleBottomRight).toBeHidden();
    await expect(this.resizeHandleBottomLeft).toBeHidden();

    // when
    await this.mainLayoutPage.container.hover();

    // then
    await expect(this.qrCodePlaceholder).toBeHidden();

    // when
    await this.hoverOverQrCode();

    // then
    await expect(this.qrCodePlaceholder).toBeVisible();
    await expect(this.resizeHandleBottomRight).toBeHidden();
    await expect(this.resizeHandleBottomLeft).toBeHidden();
  }

  async verifyWithUrl() {
    const qrCodeUrl = await this.getQrCodeUrl();
    expect(qrCodeUrl).not.toEqual("");

    await expect(this.qrCodeButton).toBeVisible();
    await expect(this.qrCodeSvg).toBeVisible();
    await expect(this.qrCodePlaceholder).toBeHidden();
  }
}
