import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";
import { useTitle, useSetTitle, useFooter, useSetFooter } from "./layout.ts";

describe("layout store (properties)", () => {
  it("setters update title and footer (property)", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (title, footer) => {
        const { result, unmount } = renderHook(() => ({
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
        unmount();
      }),
    );
  });
});
