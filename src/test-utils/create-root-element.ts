/**
 * Test-only side effect: creates the `<div id="root">` that `src/main.tsx`
 * mounts into.
 *
 * `main.tsx` runs its mount at module evaluation time, so the element has to
 * exist before that module is imported. ES module imports are evaluated in
 * source order, so importing this module above `main.tsx` guarantees it.
 */
export const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);
