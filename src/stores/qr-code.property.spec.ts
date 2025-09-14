import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual =
    await vi.importActual<typeof import("zustand/middleware")>(
      "zustand/middleware",
    );
  return {
    ...actual,
    persist: <T>(fn: T) => fn,
    devtools: <T>(fn: T) => fn,
  } satisfies typeof import("zustand/middleware");
});

describe("qr-code store (properties)", () => {
  it("setters write new url and size", async () => {
    const { useQrCodeUrl, useSetQrCodeUrl, useQrCodeSize, useSetQrCodeSize } =
      await import("./qr-code.ts");
    const { result } = renderHook(() => {
      const url = useQrCodeUrl();
      const setUrl = useSetQrCodeUrl();
      const size = useQrCodeSize();
      const setSize = useSetQrCodeSize();
      return { url, setUrl, size, setSize };
    });

    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 0, max: 1000 }), (url, n) => {
        act(() => result.current.setUrl(url));
        expect(result.current.url).toBe(url);
        act(() => result.current.setSize(n));
        expect(result.current.size).toBe(n);
      }),
    );
  });
});
