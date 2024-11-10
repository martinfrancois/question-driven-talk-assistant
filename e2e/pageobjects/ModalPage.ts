import { Page, Locator } from '@playwright/test';
import {AppPage} from "./AppPage";
import {MainLayoutPage} from "./MainLayoutPage";

export class ModalPage extends AppPage {
    readonly confirmButton: Locator;
    readonly cancelButton: Locator;

    private mainLayoutPage: MainLayoutPage;

    constructor(page: Page) {
        super(page);
        this.mainLayoutPage = new MainLayoutPage(page);
        this.confirmButton = page.getByTestId('modal-confirm');
        this.cancelButton = page.getByTestId('modal-cancel');
    }

    async goto(): Promise<void> {
        await this.mainLayoutPage.container.press("Control+Shift+Backspace");
    }

    async confirm() {
        await this.confirmButton.click();
    }

    async cancel() {
        await this.cancelButton.click();
    }
}
