import { expect, test } from "@playwright/test";
import { AppPage } from "./pageobjects/AppPage";
import { StorageName } from "@/stores";
import { QuestionListPage } from "./pageobjects/QuestionListPage.ts";
import { GuidedTourPage } from "./pageobjects/GuidedTourPage.ts";

// TODO remove from around 03/2025
test.describe("LocalStorage to zustand Migration e2e tests", () => {
  test("should migrate localStorage state to zustand automatically", async ({
    page,
  }) => {
    // given
    const appPage: AppPage = new AppPage(page);
    await appPage.goto(false);

    const fontSizeValue = 20;
    const footerValue = "TestWarez 2024 | François Martin";
    const darkModeValue = true;
    const qrCodeSizeValue = 97.921875;
    const qrCodeUrlValue = "https://google.com";
    const questionsValue = [
      {
        id: "1732473900640",
        text: "Question 1",
        answered: false,
        highlighted: false,
      },
      {
        id: "1732486857491",
        text: "Question 2",
        answered: false,
        highlighted: false,
      },
      {
        id: "1732486848935",
        text: "Question 3",
        answered: false,
        highlighted: false,
      },
      {
        id: "1732478797519",
        text: "Question 4",
        answered: true,
        highlighted: false,
      },
      {
        id: "1732456230144",
        text: "Question 5",
        answered: false,
        highlighted: false,
      },
    ];
    const timeFormat24hValue = false;
    const titleValue = "Integration of Testing and Development";
    const tourCompletedValue = true;

    // populate localStorage with pre-migration state
    await page.evaluate(
      ({
        fontSizeValue,
        footerValue,
        darkModeValue,
        qrCodeSizeValue,
        qrCodeUrlValue,
        questionsValue,
        timeFormat24hValue,
        titleValue,
        tourCompletedValue,
      }) => {
        localStorage.setItem("fontSize", String(fontSizeValue));
        localStorage.setItem("footer", footerValue);
        localStorage.setItem("isDarkMode", String(darkModeValue));
        localStorage.setItem("qrCodeSize", String(qrCodeSizeValue));
        localStorage.setItem("qrCodeURL", qrCodeUrlValue);
        localStorage.setItem("questions", JSON.stringify(questionsValue));
        localStorage.setItem("timeFormat24h", String(timeFormat24hValue));
        localStorage.setItem("title", titleValue);
        localStorage.setItem("tourCompleted", String(tourCompletedValue));
      },
      {
        fontSizeValue,
        footerValue,
        darkModeValue,
        qrCodeSizeValue,
        qrCodeUrlValue,
        questionsValue,
        timeFormat24hValue,
        titleValue,
        tourCompletedValue,
      },
    );

    // when
    await appPage.reload();

    // then
    const title = await appPage.getLocalStorageData(
      StorageName.LAYOUT,
      "title",
    );
    const footer = await appPage.getLocalStorageData(
      StorageName.LAYOUT,
      "footer",
    );
    const tourCompleted = await appPage.getLocalStorageData(
      StorageName.ONBOARDING,
      "tourCompleted",
    );
    const fontSize = await appPage.getLocalStorageData(
      StorageName.PREFERENCES,
      "fontSize",
    );
    const darkMode = await appPage.getLocalStorageData(
      StorageName.PREFERENCES,
      "darkMode",
    );
    const timeFormat24h = await appPage.getLocalStorageData(
      StorageName.PREFERENCES,
      "timeFormat24h",
    );
    const qrCodeUrl = await appPage.getLocalStorageData(
      StorageName.QR_CODE,
      "qrCodeUrl",
    );
    const qrCodeSize = parseFloat(
      (await appPage.getLocalStorageData(StorageName.QR_CODE, "qrCodeSize")) ??
        "-1",
    );
    const questions = await appPage.getLocalStorageData(
      StorageName.QUESTIONS,
      "questions",
    );

    expect(title).toEqual(titleValue);
    expect(footer).toEqual(footerValue);
    expect(tourCompleted).toEqual(tourCompletedValue);
    expect(fontSize).toEqual(fontSizeValue);
    expect(darkMode).toEqual(darkModeValue);
    expect(timeFormat24h).toEqual(timeFormat24hValue);
    expect(qrCodeUrl).toEqual(qrCodeUrlValue);
    expect(qrCodeSize).toEqual(qrCodeSizeValue);
    expect(questions).toEqual(questionsValue);

    const questionListPage = new QuestionListPage(page);
    const locators = await questionListPage.questionItems.all();
    expect(locators).toHaveLength(5);
    await expect(page.getByText(/Question 1/)).toBeVisible();
    await expect(page.getByText(titleValue)).toBeVisible();
    await expect(page.getByText(footerValue)).toBeVisible();

    const guidedTourPage = new GuidedTourPage(page);
    await expect(guidedTourPage.nextButton).toBeHidden();
  });
});
