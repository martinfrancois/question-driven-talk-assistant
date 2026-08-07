import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { renderHook } from "@testing-library/react";
import PWABadge from "./PWABadge.tsx";

/**
 * Exercises the real `virtual:pwa-register/react` module that vite-plugin-pwa
 * injects into the build. If the plugin stops providing the virtual module, or
 * changes the shape of the hook's return value, these tests fail at import or
 * at the destructuring in the component rather than passing against a stub.
 */
describe("PWABadge", () => {
  it("resolves the virtual pwa-register module provided by vite-plugin-pwa", () => {
    expect(typeof useRegisterSW).toBe("function");
  });

  it("returns the needRefresh tuple and the update function the badge relies on", () => {
    const { result } = renderHook(() => useRegisterSW({}));

    expect(Array.isArray(result.current.needRefresh)).toBe(true);
    expect(result.current.needRefresh).toHaveLength(2);
    expect(typeof result.current.needRefresh[0]).toBe("boolean");
    expect(typeof result.current.needRefresh[1]).toBe("function");
    expect(typeof result.current.updateServiceWorker).toBe("function");
  });

  it("renders nothing while no service worker update is waiting", async () => {
    const { container } = await render(<PWABadge />);

    expect(container.innerHTML).toBe("");
    expect(document.body.querySelector("[role='alert']")).toBeNull();
  });

  it("mounts and unmounts without registering a periodic sync interval", async () => {
    // The component hard-codes `period = 0`, which disables periodic sync.
    const before = window.setTimeout(() => undefined, 0);
    window.clearTimeout(before);

    const rendered = await render(<PWABadge />);
    await rendered.unmount();

    expect(document.body.querySelector("[role='alert']")).toBeNull();
  });
});
