import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { renderHook, act } from "@testing-library/react";
import { FullScreenQrCode } from "./FullScreenQrCode.tsx";
import { StorageName, useSetQrCodeUrl } from "@/stores";
import { pressKey } from "@/test-utils/keyboard.ts";
import { interact } from "@/test-utils/react.ts";

/**
 * Exercises the real component with the real `react-hotkeys-hook` binding and
 * the real `qrcode.react` renderer behind it.
 */
describe("FullScreenQrCode", () => {
  beforeEach(() => {
    localStorage.removeItem(StorageName.QR_CODE);
  });

  /** The QR store is shared by this file, so set the url explicitly. */
  const renderWithUrl = async (url: string) => {
    const { result } = renderHook(() => useSetQrCodeUrl());
    act(() => {
      result.current(url);
    });
    return render(<FullScreenQrCode />);
  };

  const toggle = async () => {
    await interact(() => {
      pressKey({ key: "q", code: "KeyQ", ctrl: true });
    });
  };

  const overlay = (container: HTMLElement): HTMLElement | null =>
    container.querySelector("[data-testid='fullscreen-qr-code']");

  it("renders nothing until the shortcut is pressed", async () => {
    const { container } = await renderWithUrl("https://example.com/talk");

    expect(overlay(container)).toBeNull();
  });

  it("shows a full screen QR code on ctrl+q", async () => {
    const { container } = await renderWithUrl("https://example.com/talk");

    await toggle();

    expect(overlay(container)).not.toBeNull();
    const paths = overlay(container)?.querySelectorAll("svg path") ?? [];
    expect(paths.length).toBeGreaterThan(0);
  });

  it("hides again when ctrl+q is pressed a second time", async () => {
    const { container } = await renderWithUrl("https://example.com/talk");

    await toggle();
    await toggle();

    expect(overlay(container)).toBeNull();
  });

  it("hides when the overlay is clicked", async () => {
    const { container } = await renderWithUrl("https://example.com/talk");

    await toggle();
    const el = overlay(container);
    expect(el).not.toBeNull();

    await interact(() => el?.click());

    expect(overlay(container)).toBeNull();
  });

  it("stays hidden when no url is configured", async () => {
    const { container } = await renderWithUrl("");

    await toggle();

    expect(overlay(container)).toBeNull();
  });

  it("exposes itself as a labelled modal dialog", async () => {
    const { container } = await renderWithUrl("https://example.com/talk");

    await toggle();

    const el = overlay(container);
    expect(el?.getAttribute("role")).toBe("dialog");
    expect(el?.getAttribute("aria-modal")).toBe("true");
    expect(el?.getAttribute("aria-label")).toBe("Full Screen QR Code");
    expect(el?.getAttribute("aria-keyshortcuts")).toBe(
      "Control+q to hide full screen qr code",
    );
  });
});
