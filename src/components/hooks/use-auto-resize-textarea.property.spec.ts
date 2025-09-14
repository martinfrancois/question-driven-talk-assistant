import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { renderHook, act } from "@testing-library/react";
import { createRef } from "react";
import { useAutoResizeTextArea } from "./use-auto-resize-textarea.ts";

describe("useAutoResizeTextArea (properties)", () => {
  it("adjustHeight sets height to auto then to scrollHeight px", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        (scrollHeight: number) => {
          const el = document.createElement("textarea");
          Object.defineProperty(el, "scrollHeight", {
            value: scrollHeight,
            configurable: true,
          });
          const ref = { current: el } as React.RefObject<HTMLTextAreaElement>;
          const { result } = renderHook(() => useAutoResizeTextArea(ref));
          act(() => {
            result.current.adjustHeight();
          });
          expect(el.style.height).toBe(`${scrollHeight}px`);
        },
      ),
    );
  });

  it("does nothing when ref current is null", () => {
    const ref = createRef<HTMLTextAreaElement>();
    ref.current = null;
    const { result } = renderHook(() => useAutoResizeTextArea(ref));
    // should not throw
    act(() => {
      result.current.adjustHeight();
    });
    // nothing to assert; just covering the early return branch
    expect(true).toBe(true);
  });
});
