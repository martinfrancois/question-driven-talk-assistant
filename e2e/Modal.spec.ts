import { test, expect } from '@playwright/test';
import {ModalPage} from "./pageobjects/ModalPage";
import {QuestionListPage} from "./pageobjects/QuestionListPage";
import {AppPage} from "./pageobjects/AppPage";
import {Question} from "../src/components/QuestionItem";

test.describe('Modal e2e tests', () => {
    let modalPage: ModalPage;
    let questionListPage: QuestionListPage;
    let initialQuestions: Question[];

    test.beforeEach(async ({ page }) => {
        const appPage = new AppPage(page);
        await appPage.goto();
        initialQuestions = await appPage.preloadQuestionData();
        modalPage = new ModalPage(page);
        questionListPage = new QuestionListPage(page);
        await modalPage.goto();
    });

    test('should delete all questions when confirming the modal', async () => {
        // when
        await modalPage.confirm();

        // then
        expect(await modalPage.confirmButton.isHidden()).toBeTruthy();
        await questionListPage.isInitialState();
    });

    test('should leave all questions intact when canceling the modal', async () => {
        // when
        await modalPage.cancel();

        // then
        await expect(modalPage.cancelButton).toBeHidden();
        const questions = await modalPage.getQuestions();
        expect(questions).toEqual(initialQuestions);
    });
});
