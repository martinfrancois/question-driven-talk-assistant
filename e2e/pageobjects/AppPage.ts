import { expect, Locator, Page } from "@playwright/test";
import { Question, StorageName } from "@/stores";

/**
 * Loads the app. A module function rather than a method, so page objects that
 * override `goto` or define their own `open` can't change what it does.
 */
async function loadApp(page: Page, disableTour = true): Promise<void> {
  let url = "/";
  if (disableTour) {
    url += "?disable-tour"; // ensure we only show the tour when we want to test it specifically
  }
  await page.goto(url);
}

export class AppPage {
  readonly page: Page;
  readonly helpIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpIcon = page.getByTestId("help-icon");

    // fail the test immediately when a warning or error is logged to the console
    page.on("console", (message) => {
      if (
        (message.type() === "error" || message.type() === "warning") &&
        !message // TODO remove when react-joyride stopped using InstallTrigger on Firefox
          .text()
          .startsWith('[JavaScript Warning: "InstallTrigger is deprecated')
      ) {
        throw new Error(message.text());
      }
    });
  }

  async goto(disableTour = true) {
    await loadApp(this.page, disableTour);
  }

  /**
   * Stores `state` in localStorage before the app's own scripts run on the
   * next page load, so the stores hydrate from it without an extra reload.
   * Call it before the test opens the app. Later reloads in the same test keep
   * whatever the app persisted since, instead of seeding again.
   */
  async seedLocalStorage<T>(
    storageName: StorageName,
    state: Record<string, T>,
  ): Promise<void> {
    await this.page.addInitScript(
      ({ storageName, state }) => {
        const seededMarker = `e2e-seeded:${storageName}`;
        if (sessionStorage.getItem(seededMarker)) return;
        sessionStorage.setItem(seededMarker, "true");
        localStorage.setItem(storageName, JSON.stringify({ state }));
      },
      { storageName, state }, // Pass variables to browser context
    );
  }

  async setLocalStorageData<T>(
    storageName: StorageName,
    key: string,
    value: T,
  ) {
    const state: Record<string, T> | null =
      (await this.getLocalStorageData(storageName)) ?? {};
    state[key] = value;
    await this.page.evaluate(
      ({ storageName, state }) => {
        localStorage.setItem(storageName, JSON.stringify({ state }));
      },
      { storageName, state }, // Pass variables to browser context
    );
  }

  async getLocalStorageData<T>(
    storageName: StorageName,
    key?: string,
  ): Promise<T | null> {
    return await this.page.evaluate(
      ({ storageName, key }) => {
        const item = localStorage.getItem(storageName);
        if (!item) {
          return null;
        }
        const state = (
          JSON.parse(item) as Record<"state", Record<string, T> | T>
        ).state;
        if (key) {
          return (state as Record<string, T>)[key];
        } else {
          return state as T;
        }
      },
      { storageName, key }, // Pass variables to browser context
    );
  }

  reload(options?: Parameters<Page["reload"]>[0]): ReturnType<Page["reload"]> {
    return this.page.reload(options);
  }

  async getQuestions(): Promise<Question[]> {
    return (
      (await this.getLocalStorageData<Question[]>(
        StorageName.QUESTIONS,
        "questions",
      )) ?? []
    );
  }

  async isTourCompleted(): Promise<boolean> {
    return (
      (await this.getLocalStorageData<boolean>(
        StorageName.ONBOARDING,
        "tourCompleted",
      )) === true
    );
  }

  async expectTourCompleted(isTourCompleted: boolean): Promise<void> {
    await expect
      .poll(async () => await this.isTourCompleted())
      .toBe(isTourCompleted);
  }

  async setTourCompleted(isTourCompleted: boolean): Promise<void> {
    return await this.setLocalStorageData<boolean>(
      StorageName.ONBOARDING,
      "tourCompleted",
      isTourCompleted,
    );
  }

  /** Opens the app with three questions in localStorage and returns them. */
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
    await this.seedLocalStorage(StorageName.QUESTIONS, { questions });
    await loadApp(this.page);
    return questions;
  }

  async getQrCodeUrl(): Promise<string> {
    return (
      (await this.getLocalStorageData<string>(
        StorageName.QR_CODE,
        "qrCodeUrl",
      )) ?? ""
    );
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
