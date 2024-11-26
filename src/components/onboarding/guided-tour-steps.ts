import { Step } from "react-joyride";

export const steps: Step[] = [
  {
    target: '[data-testid="main-header"]',
    content: "Click the title to edit it.",
    disableBeacon: true, // Start the tour immediately
  },
  {
    target: '[data-testid="main-footer"]',
    content: "Click the footer to edit it.",
  },
  {
    target: "textarea:first-of-type",
    content: "Click the first line to enter a question.",
  },
  {
    target: "textarea:first-of-type",
    content:
      "Click on the text of the first question, then press Enter to add a new question below.",
    styles: {
      options: { overlayColor: "rgba(0, 0, 0, 0.2)" },
    },
  },
  {
    target: 'input[type="checkbox"]:first-of-type',
    content: "Click the checkbox to highlight the question you're answering.",
    styles: {
      options: { overlayColor: "rgba(0, 0, 0, 0.2)" },
    },
  },
  {
    target: 'input[type="checkbox"]:first-of-type',
    content: "Click the checkbox again to mark the question as answered.",
  },
  {
    target: '[data-testid="reorder-button"]:first-of-type',
    content:
      "Hover over the area left of the checkbox to reveal the ☰ icon, then click and drag it to reorder the question.",
    offset: 50,
  },
  {
    target: '[data-testid="qr-code"]',
    content:
      "Hover over the QR code area at the top right, then click it, and enter the URL it should point to.",
    placement: "left",
  },
  {
    target: '[data-testid="qr-code"]',
    content:
      "Drag the bottom-left or bottom-right corner of the QR code to resize it.",
    placement: "left",
  },
  {
    target: '[data-testid="qr-code"]',
    content: "To hide the QR code, clear its URL.",
    placement: "left",
  },
  {
    target: '[data-testid="time-display"]',
    content:
      "Click the current time to toggle between 24-hour and 12-hour formats.",
    placement: "bottom-end",
  },
  {
    target: '[data-testid="help-icon"] svg',
    content: "Click the help icon to view all features and keyboard shortcuts.",
    placement: "top-end",
    styles: {
      options: { overlayColor: "rgba(0, 0, 0, 0.1)" },
    },
  },
];
