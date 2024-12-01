import { ReactElement } from "react";

export interface SkipLinkProps {
  text?: string;
  href?: string;
  shortcut?: string;
}

/**
 * Adds a skip link / bypass block to a page to improve accessibility according
 * to (WCAG 2.1, 2.4.1, Level A).
 *
 * By pressing the tab key after navigating to the page, a link appears in the
 * top left corner with the specified {@link text}.
 * After pressing enter, the focus will jump to the specified {@link href}.
 *
 * To integrate this into a website, it is recommended to wrap the part which
 * contains the main content in a {@code } block.
 * Then, add this component somewhere early in the DOM, preferably as the first
 * element.
 * @param {string} [text=Skip to content] - The text to be shown when pressing
 *                                          the tab key.
 * @param {string} [href=#main-content] - Where the link should lead to when
 *                                        pressing enter, usually prefixed with
 *                                        {@code #} to jump to an {@code id}.
 * @param {string} [shortcut] - A keyboard shortcut to activate the skip link,
 *                              specified in the format accepted by the
 *                              `aria-keyshortcuts` attribute (e.g.,
 *                              "Control+Alt+S"). This allows assistive
 *                              technologies to inform users about available
 *                              keyboard shortcuts.
 */
export const SkipLink = ({
  text = "Skip to content",
  href = "#main-content",
  shortcut,
}: SkipLinkProps): ReactElement => (
  <a
    href={href}
    className={`focus:outline-secondary text-md fixed left-2 top-2 z-[1010] -translate-y-20 rounded-lg bg-neutral-100 p-1 text-neutral-800 outline-none transition-transform duration-200 ease-in-out focus:translate-y-0 focus:outline focus:outline-2 focus:outline-offset-2 dark:bg-neutral-800 dark:text-neutral-100 print:hidden`}
    aria-keyshortcuts={shortcut}
  >
    {text}
  </a>
);
