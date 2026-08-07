import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import GuidedTour from "./GuidedTour.tsx";
import { steps } from "./guided-tour-steps.ts";
import MainLayout from "../layout/MainLayout.tsx";
import App from "@/App.tsx";
import {
  StorageName,
  useCompleteTour,
  useRestartTour,
  useTourCompleted,
} from "@/stores";
import { interact } from "@/test-utils/react.ts";

/**
 * Drives the real `react-joyride` tour over the real application layout, so the
 * step targets are resolved against real DOM nodes. A regression in joyride, or
 * a step whose selector no longer matches anything the app renders, fails here.
 */
describe("GuidedTour", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.ONBOARDING);
    localStorage.removeItem(StorageName.QUESTIONS);
    localStorage.removeItem(StorageName.QR_CODE);
    vi.stubGlobal("prompt", () => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const tourHook = () =>
    renderHook(() => ({
      tourCompleted: useTourCompleted(),
      completeTour: useCompleteTour(),
      restartTour: useRestartTour(),
    }));

  const renderTour = async (completed: boolean) => {
    const hook = tourHook();
    act(() => {
      if (completed) hook.result.current.completeTour();
      else hook.result.current.restartTour();
    });
    const rendered = await render(
      <>
        <MainLayout />
        <GuidedTour />
      </>,
    );
    return { ...rendered, hook };
  };

  const portal = (): HTMLElement | null =>
    document.getElementById("react-joyride-portal");

  const tooltip = (): HTMLElement | null =>
    document.getElementById("joyride-tooltip-content");

  const joyrideButton = (name: string): HTMLElement | null =>
    document.body.querySelector<HTMLElement>(`[data-testid='button-${name}']`);

  const waitForTooltip = async (): Promise<void> => {
    await vi.waitFor(
      () => {
        if (!tooltip()) throw new Error("joyride tooltip not rendered yet");
      },
      { timeout: 3000 },
    );
  };

  it("starts the tour while it has not been completed", async () => {
    await renderTour(false);

    await waitForTooltip();

    expect(portal()).not.toBeNull();
    expect(tooltip()?.textContent).toBe(steps[0].content);
  });

  it("offers skip, next and close controls", async () => {
    await renderTour(false);
    await waitForTooltip();

    expect(joyrideButton("skip")?.textContent).toBe("Skip");
    expect(joyrideButton("primary")?.textContent).toBe("Next");
    expect(joyrideButton("close")).not.toBeNull();
  });

  it("advances to the next documented step", async () => {
    await renderTour(false);
    await waitForTooltip();

    await interact(() => joyrideButton("primary")?.click());
    await vi.waitFor(() => {
      if (tooltip()?.textContent !== steps[1].content) {
        throw new Error("still on the first step");
      }
    });

    expect(tooltip()?.textContent).toBe(steps[1].content);
  });

  it("marks the tour completed when it is skipped", async () => {
    const { hook } = await renderTour(false);
    await waitForTooltip();
    expect(hook.result.current.tourCompleted).toBe(false);

    await interact(() => joyrideButton("skip")?.click());
    await vi.waitFor(() => {
      if (!hook.result.current.tourCompleted) {
        throw new Error("tour not marked completed yet");
      }
    });

    expect(hook.result.current.tourCompleted).toBe(true);
  });

  it("tears the tour down once it is completed", async () => {
    await renderTour(false);
    await waitForTooltip();

    await interact(() => joyrideButton("skip")?.click());
    await vi.waitFor(() => {
      if (tooltip()) throw new Error("tooltip still visible");
    });

    expect(tooltip()).toBeNull();
  });

  it("does not run at all for a returning user", async () => {
    await renderTour(true);

    // Give joyride the same amount of time it needs to mount a running tour.
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(tooltip()).toBeNull();
  });
});

describe("guided tour steps", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.QUESTIONS);
    localStorage.removeItem(StorageName.QR_CODE);
    vi.stubGlobal("prompt", () => null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("every step targets an element the application actually renders", async () => {
    // Rendered against the whole app, because some steps point at chrome that
    // lives outside the layout (the help icon, for instance).
    const hook = renderHook(() => useCompleteTour());
    act(() => {
      hook.result.current();
    });
    await render(<App />);

    for (const step of steps) {
      const target = step.target;
      if (typeof target !== "string") {
        throw new Error("every tour step is expected to use a css selector");
      }
      expect(
        document.body.querySelector(target),
        `no element matches step target ${target}`,
      ).not.toBeNull();
    }
  });

  it("every step carries content", () => {
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      const content = step.content;
      if (typeof content !== "string") {
        throw new Error("every tour step is expected to carry text content");
      }
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
