import { Page, Locator, expect } from "@playwright/test";
import { AppPage } from "./AppPage";

// TODO needs some polish, check if it covers all cases
export class QuestionItemPage extends AppPage {
  readonly questionItem: Locator;
  readonly checkbox: Locator;
  readonly textarea: Locator;
  readonly reorderButton: Locator;

  constructor(page: Page, questionId?: string, questionItem?: Locator) {
    super(page);
    if (questionItem) {
      this.questionItem = questionItem;
    } else {
      this.questionItem = page.getByTestId(`question-item-${questionId}`);
    }
    this.checkbox = this.questionItem.locator(
      '[data-testid^="question-checkbox-"]',
    );
    this.textarea = this.questionItem.locator("textarea");
    this.reorderButton = this.questionItem.getByTestId("reorder-button");
  }

  async focusTextarea(): Promise<void> {
    await this.textarea.focus();
  }

  async setText(content: string): Promise<void> {
    await this.textarea.fill(content);
  }

  async expectHighlighted(highlighted: boolean): Promise<void> {
    let expectation = expect(this.textarea);
    if (!highlighted) {
      expectation = expectation.not;
    }
    await expectation.toHaveAttribute("data-highlighted", "true");
  }

  async expectText(text: string): Promise<void> {
    await expect(this.textarea).toHaveText(text);
  }

  async expectAnswered(answered: boolean): Promise<void> {
    let expectation = expect(this.checkbox);
    if (!answered) {
      expectation = expectation.not;
    }
    await expectation.toBeChecked();
  }

  async expectReorderButtonVisible(visible: boolean): Promise<void> {
    let expectation = expect(this.reorderButton);
    if (!visible) {
      expectation = expectation.not;
    }
    await expectation.toHaveCSS("opacity", "1");
  }

  async pressKey(key: string): Promise<void> {
    await this.textarea.press(key);
  }

  async toggleAnswered(): Promise<void> {
    await this.checkbox.click();
  }

  async verifyVisible(): Promise<void> {
    await expect(this.questionItem).toBeVisible();
    await expect(this.checkbox).toBeVisible();
    await expect(this.textarea).toBeVisible();
  }

  async moveCursorToEnd(): Promise<void> {
    await this.textarea.evaluate((el: HTMLTextAreaElement) => {
      const value = el.value;
      el.selectionStart = el.selectionEnd = value.length;
    });
  }

  async moveCursorToStart(): Promise<void> {
    await this.textarea.evaluate((el: HTMLTextAreaElement) => {
      el.selectionStart = el.selectionEnd = 0;
    });
  }

  async setCursorPosition(position: number): Promise<void> {
    await this.textarea.evaluate((el: HTMLTextAreaElement, pos: number) => {
      el.selectionStart = el.selectionEnd = pos;
    }, position);
  }

  async getCursorPosition(): Promise<number> {
    return await this.textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart || 0,
    );
  }

  async moveQuestionUpShortcut(): Promise<void> {
    await this.textarea.press("Control+Shift+ArrowUp");
  }

  async moveQuestionDownShortcut(): Promise<void> {
    await this.textarea.press("Control+Shift+ArrowDown");
  }

  async getFontSize(): Promise<number> {
    return await this.textarea.evaluate((el: HTMLElement) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
  }
}
