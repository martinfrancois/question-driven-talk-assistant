import { expect, Locator, Page } from "@playwright/test";
import { Question } from "../../src/components/QuestionItem";

export class AppPage {
  readonly page: Page;
  readonly helpIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpIcon = page.getByTestId("help-icon");
  }

  async goto() {
    await this.page.goto("/");
  }

  async setLocalStorageData<T>(key: string, value: T) {
    await this.page.evaluate(
      ([key, value]) => {
        localStorage.setItem(key as string, JSON.stringify(value));
      },
      [key, value],
    );
  }

  async getLocalStorageData<T>(key: string): Promise<T | null> {
    return await this.page.evaluate((key) => {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      try {
        return JSON.parse(item) as T;
      } catch {
        // content is not JSON
        return item as T;
      }
    }, key);
  }

  reload(options?: Parameters<Page["reload"]>[0]): ReturnType<Page["reload"]> {
    return this.page.reload(options);
  }

  async getQuestions(): Promise<Question[]> {
    return (await this.getLocalStorageData<Question[]>("questions")) ?? [];
  }

  async preloadQuestionData(): Promise<Question[]> {
    const questions = [
      {
        id: "first-question-id",
        text: "First question\nWith two lines\n",
        answered: true,
        highlighted: false,
      },
      {
        id: "middle-question-id",
        text: "\n\nMiddle question with empty lines",
        answered: false,
        highlighted: true,
      },
      { id: "last-question-id", text: "", answered: false, highlighted: false },
    ];
    await this.setLocalStorageData("questions", questions);
    await this.reload();
    return questions;
  }

  async getQrCodeUrl(): Promise<string> {
    return (await this.getLocalStorageData<string>("qrCodeURL")) ?? "";
  }

  async openHelp(withShortcut: boolean): Promise<void> {
    if (withShortcut) {
      await this.press("Control+h");
    } else {
      await expect(this.helpIcon).toBeVisible();
      await this.helpIcon.click();
    }
  }

  async press(key: string) {
    await this.page.press("body", key);
  }
}
