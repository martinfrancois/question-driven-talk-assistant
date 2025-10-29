import { test, expect } from "@playwright/test";
import { QrCodeComponentPage } from "./pageobjects/QrCodeComponentPage";
import { MainLayoutPage } from "./pageobjects/MainLayoutPage";
import { StorageName } from "@/stores";

test.describe("MainLayout e2e tests", () => {
  let mainLayoutPage: MainLayoutPage;

  test.beforeEach(async ({ page }) => {
    mainLayoutPage = new MainLayoutPage(page);
    await mainLayoutPage.goto();
  });

  test("should edit header in MainLayout", async () => {
    // given
    const newTitle = "New Title";
    expect(await mainLayoutPage.header.textContent()).not.toBe(newTitle);

    // when
    await mainLayoutPage.editHeader(newTitle);

    // then
    expect(await mainLayoutPage.header.textContent()).toBe(newTitle);
  });

  test("empty header in MainLayout should be editable", async () => {
    // given
    await mainLayoutPage.setLocalStorageData(StorageName.LAYOUT, "title", "");
    await mainLayoutPage.reload();
    const newTitle = "New Title";
    expect(await mainLayoutPage.header.textContent()).not.toBe(newTitle);

    // when
    await mainLayoutPage.editHeader(newTitle);

    // then
    expect(await mainLayoutPage.header.textContent()).toBe(newTitle);
  });

  test("should edit footer in MainLayout", async () => {
    // given
    const newFooter = "New Footer";
    expect(await mainLayoutPage.footer.textContent()).not.toBe(newFooter);

    // when
    await mainLayoutPage.editFooter(newFooter);

    // then
    expect(await mainLayoutPage.footer.textContent()).toBe(newFooter);
  });

  test("empty footer in MainLayout should be editable", async () => {
    // given
    await mainLayoutPage.setLocalStorageData(StorageName.LAYOUT, "footer", "");
    await mainLayoutPage.reload();
    const newFooter = "New Footer";
    expect(await mainLayoutPage.footer.textContent()).not.toBe(newFooter);

    // when
    const footerHandle = await mainLayoutPage.footer.elementHandle();
    expect(footerHandle).not.toBeNull();
    if (footerHandle) {
      const heightWithoutPadding = await mainLayoutPage.page.evaluate((el) => {
        const style = window.getComputedStyle(el);
        let height = parseFloat(style.height);
        height -= parseFloat(style.paddingTop);
        height -= parseFloat(style.paddingBottom);
        return height;
      }, footerHandle);
      expect(heightWithoutPadding).toBeGreaterThan(0);
    }
    await mainLayoutPage.editFooter(newFooter);

    // then
    expect(await mainLayoutPage.footer.textContent()).toBe(newFooter);
  });

  test("should toggle time format in TimeDisplay", async () => {
    // given
    const initialTime = await mainLayoutPage.timeDisplay.textContent();

    // when
    await mainLayoutPage.toggleTimeFormat();
    const toggledTime = await mainLayoutPage.timeDisplay.textContent();

    // then
    // TODO potentially flaky, if toggled right before minute advances
    expect(toggledTime).not.toEqual(initialTime);
  });

  test("should not open fullscreen QR code when URL is empty", async () => {
    // when
    await mainLayoutPage.toggleFullscreenQrCode();

    // then
    await expect(mainLayoutPage.fullscreenQrCode).toBeHidden();
  });

  test("should open and close fullscreen QR code", async ({ page }) => {
    // given
    const qrCodeComponentPage = new QrCodeComponentPage(page);
    await qrCodeComponentPage.setExampleQrCodeURL();

    // when
    await mainLayoutPage.toggleFullscreenQrCode();

    // then
    await expect(mainLayoutPage.fullscreenQrCode).toBeVisible();

    // when
    await mainLayoutPage.toggleFullscreenQrCode();

    // then
    await expect(mainLayoutPage.fullscreenQrCode).toBeHidden();
  });
});
