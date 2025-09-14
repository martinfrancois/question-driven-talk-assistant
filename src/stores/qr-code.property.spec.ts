import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { renderHook, act } from "@testing-library/react";

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
      fc.property(
        fc.string(),
        fc.integer({ min: 0, max: 1000 }),
        (url: string, n: number) => {
          act(() => result.current.setUrl(url));
          expect(result.current.url).toBe(url);
          act(() => result.current.setSize(n));
          expect(result.current.size).toBe(n);
        },
      ),
    );
  });
});
