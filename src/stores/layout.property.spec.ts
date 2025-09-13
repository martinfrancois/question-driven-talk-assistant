import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("zustand/middleware", async () => {
  const actual = await vi.importActual<any>("zustand/middleware");
  return {
    ...actual,
    persist: (fn: any) => fn,
    devtools: (fn: any) => fn,
  };
});

describe("layout store (properties)", () => {
  it("setters update title and footer", async () => {
    const { useTitle, useSetTitle, useFooter, useSetFooter } = await import(
      "./layout.ts"
    );
    const { result } = renderHook(() => ({
      title: useTitle(),
      setTitle: useSetTitle(),
      footer: useFooter(),
      setFooter: useSetFooter(),
    }));

    act(() => {
      result.current.setTitle("A");
      result.current.setFooter("B");
    });
    // Re-render reflects updates
    expect(result.current.title).toBe("A");
    expect(result.current.footer).toBe("B");
  });
});
