import { expect, test } from "@playwright/test";
import { QrCodeComponentPage } from "./pageobjects/QrCodeComponentPage";
import { StorageName } from "@/stores";

test.describe("QrCodeComponent e2e tests", () => {
  let qrCodeComponentPage: QrCodeComponentPage;

  test.beforeEach(({ page }) => {
    qrCodeComponentPage = new QrCodeComponentPage(page);
  });

  test("should initially not show a QR code without URL in localStorage", async () => {
    await qrCodeComponentPage.goto();
    await qrCodeComponentPage.verifyNoUrl();
  });

  test("should initially show a QR code with URL in localStorage", async () => {
    // when
    await qrCodeComponentPage.gotoWithExampleQrCodeUrl();

    // then
    await qrCodeComponentPage.verifyWithUrl();
  });

  test("should show QR code after setting a URL", async () => {
    // given
    const url = "https://example.com";
    await qrCodeComponentPage.goto();

    // when
    await qrCodeComponentPage.setQrCodeURL(url);

    // then
    await qrCodeComponentPage.verifyWithUrl();
  });

  test("should hide QR code when setting URL as empty", async () => {
    // given
    await qrCodeComponentPage.gotoWithExampleQrCodeUrl();

    // when
    await qrCodeComponentPage.setQrCodeURL("");

    // then
    await qrCodeComponentPage.verifyNoUrl();
  });

  ["bottom-right", "bottom-left"].forEach((resizeDirection: string) => {
    test(`should resize QR code when dragging from ${resizeDirection}`, async () => {
      // given
      await qrCodeComponentPage.gotoWithExampleQrCodeUrl();
      const initialSize = await qrCodeComponentPage.getLocalStorageData(
        StorageName.QR_CODE,
        "qrCodeSize",
      );

      // when
      await qrCodeComponentPage.resizeQrCode("bottom-right");

      // then
      const changedSize = await qrCodeComponentPage.getLocalStorageData(
        StorageName.QR_CODE,
        "qrCodeSize",
      );
      expect(changedSize).not.toEqual(initialSize);
    });
  });
});
