# Question-Driven Talk Assistant

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmartinfrancois%2Fquestion-driven-talk-assistant.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmartinfrancois%2Fquestion-driven-talk-assistant?ref=badge_shield)

A web application designed to help speakers manage audience questions during live sessions.
Easily add, highlight, and track questions, with intuitive keyboard shortcuts and a clean interface optimized for both light and dark themes.

You can use it here: https://qa.fmartin.ch

Supported Browsers: Chrome, Firefox

## User Documentation

### Features

- **Question Management**: Add, edit, reorder, and delete questions seamlessly.
- **Highlighting**: Emphasize the question you are currently answering by highlighting it for easy visibility.
- **Answer Tracking**: Mark questions as answered to keep track during your presentation.
- **Keyboard Shortcuts**: Navigate and manage questions efficiently without leaving the keyboard.
- **Time Display**: View the current time in 12-hour or 24-hour format.
- **QR Code Display**: Optionally show a QR code linking to a URL of your choice, with adjustable size and full-screen display feature.
- **Dark Mode Support**: Toggle dark mode on or off by pressing a keyboard shortcut.
- **Offline Support**: Once the page is loaded, you don't need an internet connection anymore to use it.
- **Local Data Persistence**: Everything on the page is saved to your browser's local storage, so you don't have to worry if you need to refresh!
- **Seamless Font Resizing**: Resize the font size of the questions to ensure your audience from the back of the room can read them as well.
- **Markdown Export**: Save your list of questions to a Markdown file by pressing Ctrl + S.
- **Help Window:** Quickly access a reference of all keyboard shortcuts and features by clicking the help icon in the bottom right corner or by pressing Ctrl + H.

### How to Use

1. **Adding Questions**: Press `Enter` while editing a question to add a new one.
2. **Editing Questions**: Click on a question to edit its text directly.
3. **Reordering Questions**: Click and drag the handle (`≡`) next to a question to move it up or down.
4. **Highlighting Questions**: When you want to answer a question, click the checkbox next to it once to highlight it.
5. **Marking as Answered**: Click the checkbox of a highlighted question to mark it as answered.
6. **Unmarking Questions**: Click the checkbox of an answered question to unmark it.
7. **Editing Title and Footer**: Click on the title at the top or the footer at the bottom to edit the text.
8. **Time Format**: Click on the time display to toggle between 12-hour and 24-hour formats.
9. **QR Code**:
   - Click on the QR code area on the top right to set or change the URL.
   - If no URL is set, a placeholder "QR" text is displayed when hovering over the top right corner.
   - Resize the QR code by dragging the bottom-right or bottom-left corner.
   - Press `Ctrl + Q` to show the QR code on the entire screen. Press again to hide.
10. **Dark Mode**: Toggle dark mode on or off by pressing `Ctrl + D`.
11. **Font Resizing**:
    - **Increase Font Size**: Press `Ctrl + P` (P for Plus) to increase the font size of the questions.
    - **Decrease Font Size**: Press `Ctrl + M` (M for Minus) to decrease the font size.
12. **Saving Questions to Markdown**:
    - Press `Ctrl + S` to save the current list of questions to a Markdown file. This allows you to keep a record of the questions for future reference or sharing.
13. **Full-Screen Mode**:
    - Press `Ctrl + F` to enter full-screen mode, maximizing the application's visibility during your presentation.
14. **Clearing All Questions**:
    - Press `Ctrl + Shift + Backspace` to clear all questions. A confirmation dialog will appear to prevent accidental deletion.
15. **Accessing Help**:
    - Click the help icon in the bottom right corner or press `Ctrl + H` to open a pop-up window displaying all keyboard shortcuts and features for quick reference.

### Keyboard Shortcuts Reference

- **Navigation**:
  - `Tab`: Move to the next question.
  - `Shift + Tab`: Move to the previous question.
  - `Arrow Up`: Move cursor up within a question (if the question has multiple lines of text) or to the previous question.
  - `Arrow Down`: Move cursor down within a question (if the question has multiple lines of text) or to the next question.
- **Question Management**:
  - `Shift + Enter`: Add a new line to a question.
  - `Ctrl + Enter`: Clicks the corresponding checkbox of the currently focused question text.
  - `Enter`: Add a new question below the current one.
  - `Backspace` on empty question: Delete the current question.
  - `Ctrl + Shift + Backspace`: Clear all questions upon confirming a dialog.
- **Reordering Questions**:
  - `Ctrl + Shift + Up`: Move the current question up.
  - `Ctrl + Shift + Down`: Move the current question down.
- **Additional Features**:
  - `Ctrl + P`: Increase font size (P => Plus).
  - `Ctrl + M`: Decrease font size (M => Minus).
  - `Ctrl + D`: Toggle dark mode.
  - `Ctrl + Q`: Show a large QR code in the middle of the screen.
  - `Ctrl + F`: Show the web page in full-screen mode.
  - `Ctrl + S`: Save the current list of questions to a Markdown file.
  - `Ctrl + H`: Open the help pop-up window displaying keyboard shortcuts.
  - `Ctrl + Shift + T`: Edit title text.
  - `Ctrl + Shift + F`: Edit footer text.
  - `Ctrl + Shift + Q`: Edit QR code URL.
  - `Ctrl + Shift + E`: Edit the first question's text.
- **Highlighting and Answering**:
  - Click checkbox once: Highlight the question.
  - Click highlighted checkbox: Mark question as answered.
  - Click answered checkbox: Unmark as answered.

## Development Setup

### Prerequisites

- [**Bun**](https://bun.com/get) (1.2.14 or newer recommended)

### Steps to Run Locally

1. **Clone the Repository**:

```bash
git clone https://github.com/martinfrancois/question-driven-talk-assistant.git
cd question-driven-talk-assistant
```

2. **Install Dependencies**:

```bash
bun install
```

3. **Start Development Server**:

```bash
bun dev
```

4. **Open the Application**:
   Open `http://localhost:5173/` in your browser.

### Available Scripts

| Script                     | Command                |
| -------------------------- | ---------------------- |
| Install dependencies       | `bun install`          |
| Run during development     | `bun dev`              |
| Build                      | `bun run build`        |
| Run build locally          | `bun preview`          |
| Lint                       | `bun lint`             |
| Unit tests                 | `bun test:unit`        |
| Update unit test snapshots | `bun test:unit:update` |
| End-to-end tests           | `bun test:e2e`         |
| Check                      | `bun run check`        |

**Note**: Offline support is off during development.

### Development Notes

- **File Structure**:
  - `src/components`: React components
  - `src/components/ui`: Reusable React components
  - `src/App.tsx`: Main application file
  - `src/**/*.spec.ts(x)`: Unit tests
  - `e2e`: Playwright end-to-end tests
- **Styling**:
  - `tailwind`
  - `shadcn/ui`
- **State management**:
  - `zustand`
- **Keyboard Shortcuts**:
  - `react-hotkeys-hook`
- **Code style**:
  - `eslint`
  - `prettier`
- **Testing**:
  - `vitest`
  - `vitest-browser-react`
  - `@testing-library/react`
  - `playwright`

### Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) to understand our community guidelines.

## License

This project is licensed under the [AGPL License](./LICENSE.md).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmartinfrancois%2Fquestion-driven-talk-assistant.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmartinfrancois%2Fquestion-driven-talk-assistant?ref=badge_large)
