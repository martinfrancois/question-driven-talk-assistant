import { test, expect } from '@playwright/test';
import { QRCodeComponentPage } from './pageobjects/QRCodeComponentPage';

test.describe('QRCodeComponent e2e tests', () => {
    let qrCodeComponentPage: QRCodeComponentPage;

    test.beforeEach(async ({ page }) => {
        qrCodeComponentPage = new QRCodeComponentPage(page);
        await qrCodeComponentPage.goto();
    });

    test('should initially not show a QR code without URL in localStorage', async () => {
        await qrCodeComponentPage.verifyNoUrl();
    });

    test('should initially show a QR code with URL in localStorage', async () => {
        // when
        await qrCodeComponentPage.setExampleQrCodeURL();

        // then
        await qrCodeComponentPage.verifyWithUrl();
    });

    test('should show QR code after setting a URL', async () => {
        // given
        const url = 'https://example.com';

        // when
        await qrCodeComponentPage.setQRCodeURL(url);

        // then
        await qrCodeComponentPage.verifyWithUrl();
    });

    test('should hide QR code when setting URL as empty', async () => {
        // given
        await qrCodeComponentPage.setExampleQrCodeURL();

        // when
        await qrCodeComponentPage.setQRCodeURL("");

        // then
        await qrCodeComponentPage.verifyNoUrl();
    });

    ["bottom-right", "bottom-left"].forEach((resizeDirection: string) => {
        test(`should resize QR code when dragging from ${resizeDirection}`, async () => {
            // given
            await qrCodeComponentPage.setExampleQrCodeURL();
            const initialSize = await qrCodeComponentPage.getLocalStorageData("qrCodeSize");

            // when
            await qrCodeComponentPage.resizeQRCode('bottom-right');

            // then
            const changedSize = await qrCodeComponentPage.getLocalStorageData("qrCodeSize");
            expect(changedSize).not.toEqual(initialSize);
        });
    });
});
