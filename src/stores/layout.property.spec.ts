import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";

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

describe("layout store (properties)", () => {
  it("setters update title and footer (property)", async () => {
    const { useTitle, useSetTitle, useFooter, useSetFooter } = await import(
      "./layout.ts"
    );

    fc.assert(
      fc.property(fc.string(), fc.string(), (title, footer) => {
        const { result } = renderHook(() => ({
          title: useTitle(),
          setTitle: useSetTitle(),
          footer: useFooter(),
          setFooter: useSetFooter(),
        }));

        act(() => {
          result.current.setTitle(title);
          result.current.setFooter(footer);
        });

        expect(result.current.title).toBe(title);
        expect(result.current.footer).toBe(footer);
      }),
    );
  });
});
