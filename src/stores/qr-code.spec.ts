import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useQrCodeSize,
  useQrCodeUrl,
  useSetQrCodeSize,
  useSetQrCodeUrl,
} from "./qr-code.ts";
import { StorageName } from "./storage-names.ts";

const DEFAULT_QR_CODE_SIZE = 100;

/**
 * Exercises the real zustand QR code store, including the real persist
 * middleware writing to the browser's real `localStorage`.
 */
describe("qr code store", () => {
  const readPersisted = (): unknown =>
    JSON.parse(localStorage.getItem(StorageName.QR_CODE) ?? "null");

  const renderQrCode = () =>
    renderHook(() => ({
      url: useQrCodeUrl(),
      setUrl: useSetQrCodeUrl(),
      size: useQrCodeSize(),
      setSize: useSetQrCodeSize(),
    }));

  /**
   * The store module is shared by every test in this file and rehydrates from
   * `localStorage`, so each test restores the documented defaults first.
   */
  const renderNormalised = () => {
    const rendered = renderQrCode();
    act(() => {
      rendered.result.current.setUrl("");
    });
    act(() => {
      rendered.result.current.setSize(DEFAULT_QR_CODE_SIZE);
    });
    localStorage.removeItem(StorageName.QR_CODE);
    return rendered;
  };

  beforeEach(() => {
    localStorage.removeItem(StorageName.QR_CODE);
  });

  it("normalises to an empty url and the default size", () => {
    const { result } = renderNormalised();

    expect(result.current.url).toBe("");
    expect(result.current.size).toBe(DEFAULT_QR_CODE_SIZE);
  });

  it("stores the url that was set", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setUrl("https://example.com/talk");
    });

    expect(result.current.url).toBe("https://example.com/talk");
  });

  it("clears the url when set back to an empty string", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setUrl("https://example.com/talk");
    });
    act(() => {
      result.current.setUrl("");
    });

    expect(result.current.url).toBe("");
  });

  it("stores the size verbatim: clamping is the component's job, not the store's", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setSize(1000);
    });

    expect(result.current.size).toBe(1000);
  });

  it("changing the size leaves the url alone", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setUrl("https://example.com/talk");
    });
    act(() => {
      result.current.setSize(128);
    });

    expect(result.current.url).toBe("https://example.com/talk");
    expect(result.current.size).toBe(128);
  });

  it("persists url and size to localStorage through the persist middleware", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setUrl("https://example.com/qr");
    });
    act(() => {
      result.current.setSize(128);
    });

    expect(readPersisted()).toEqual({
      state: { qrCodeUrl: "https://example.com/qr", qrCodeSize: 128 },
      version: 0,
    });
  });
});
