import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as fc from "fast-check";

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
