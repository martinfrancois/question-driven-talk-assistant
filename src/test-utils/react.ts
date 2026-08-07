import { act } from "@testing-library/react";

/**
 * Test-only helper: runs a real user interaction and lets React flush the
 * resulting render and effects before the assertions run.
 *
 * The components under test update zustand stores from DOM event handlers, and
 * React 19 schedules the resulting render asynchronously, so assertions made
 * immediately after `element.click()` would read stale DOM.
 */
export async function interact(
  action: () => void | Promise<void>,
): Promise<void> {
  await act(async () => {
    await action();
    await Promise.resolve();
  });
}
