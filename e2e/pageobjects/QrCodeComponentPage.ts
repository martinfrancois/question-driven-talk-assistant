import { Page, Locator, expect } from "@playwright/test";
import { AppPage } from "./AppPage";
import { MainLayoutPage } from "./MainLayoutPage";

export class QrCodeComponentPage extends AppPage {
  readonly qrCodeContainer: Locator; // outer container
  readonly qrCodeSvg: Locator; // qr code itself as an SVG
  readonly qrCodePlaceholder: Locator; // placeholder text when URL is empty
  readonly resizeHandleBottomRight: Locator;
  readonly resizeHandleBottomLeft: Locator;

  private mainLayoutPage: MainLayoutPage;

  constructor(page: Page) {
    super(page);
    this.qrCodeContainer = page.getByTestId("qr-code");
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
    await this.qrCodeContainer.click();
  }

  async resizeQrCode(direction: "bottom-right" | "bottom-left") {
    const handle =
      direction === "bottom-right"
        ? this.resizeHandleBottomRight
        : this.resizeHandleBottomLeft;
    await handle.dragTo(this.qrCodeContainer, { force: true });
  }

  async hoverOverContainer() {
    await this.qrCodeContainer.hover();
  }

  async setExampleQrCodeURL() {
    await this.setLocalStorageData("qrCodeURL", "https://example.com"); // TODO refactor keys to be defined in an enum or const for reuse
    await this.reload();
  }

  async verifyNoUrl() {
    const qrCodeUrl = await this.getQrCodeUrl();
    expect(qrCodeUrl).toEqual("");

    await expect(this.qrCodeContainer).toBeVisible();
    await expect(this.qrCodeSvg).toBeHidden();
    await expect(this.resizeHandleBottomRight).toBeHidden();
    await expect(this.resizeHandleBottomLeft).toBeHidden();

    // when
    await this.mainLayoutPage.container.hover();

    // then
    await expect(this.qrCodePlaceholder).toBeHidden();

    // when
    await this.hoverOverContainer();

    // then
    await expect(this.qrCodePlaceholder).toBeVisible();
    await expect(this.resizeHandleBottomRight).toBeHidden();
    await expect(this.resizeHandleBottomLeft).toBeHidden();
  }

  async verifyWithUrl() {
    const qrCodeUrl = await this.getQrCodeUrl();
    expect(qrCodeUrl).not.toEqual("");

    await expect(this.qrCodeContainer).toBeVisible();
    await expect(this.qrCodeSvg).toBeVisible();
    await expect(this.qrCodePlaceholder).toBeHidden();
  }
}
