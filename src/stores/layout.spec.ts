import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFooter, useSetFooter, useSetTitle, useTitle } from "./layout.ts";
import { StorageName } from "./storage-names.ts";

const DEFAULT_TITLE = "Ask me anything";
const DEFAULT_FOOTER = "François Martin | www.fmartin.ch";

/**
 * Exercises the real zustand layout store, including the real persist
 * middleware writing to the browser's real `localStorage`.
 */
describe("layout store", () => {
  const readPersisted = (): unknown =>
    JSON.parse(localStorage.getItem(StorageName.LAYOUT) ?? "null");

  const renderLayout = () =>
    renderHook(() => ({
      title: useTitle(),
      setTitle: useSetTitle(),
      footer: useFooter(),
      setFooter: useSetFooter(),
    }));

  /**
   * The store module is shared by every test in this file and rehydrates from
   * `localStorage`, so each test restores the documented defaults first.
   */
  const renderNormalised = () => {
    const rendered = renderLayout();
    act(() => {
      rendered.result.current.setTitle(DEFAULT_TITLE);
    });
    act(() => {
      rendered.result.current.setFooter(DEFAULT_FOOTER);
    });
    localStorage.removeItem(StorageName.LAYOUT);
    return rendered;
  };

  beforeEach(() => {
    localStorage.removeItem(StorageName.LAYOUT);
  });

  it("normalises to the default title and footer", () => {
    const { result } = renderNormalised();

    expect(result.current.title).toBe(DEFAULT_TITLE);
    expect(result.current.footer).toBe(DEFAULT_FOOTER);
  });

  it("updates the title without touching the footer", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setTitle("My Conference Talk");
    });

    expect(result.current.title).toBe("My Conference Talk");
    expect(result.current.footer).toBe(DEFAULT_FOOTER);
  });

  it("updates the footer without touching the title", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setFooter("@example");
    });

    expect(result.current.footer).toBe("@example");
    expect(result.current.title).toBe(DEFAULT_TITLE);
  });

  it("accepts empty strings for both fields", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setTitle("");
    });
    act(() => {
      result.current.setFooter("");
    });

    expect(result.current.title).toBe("");
    expect(result.current.footer).toBe("");
  });

  it("persists title and footer to localStorage through the persist middleware", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setTitle("Persisted title");
    });
    act(() => {
      result.current.setFooter("Persisted footer");
    });

    expect(readPersisted()).toEqual({
      state: { title: "Persisted title", footer: "Persisted footer" },
      version: 0,
    });
  });

  it("round-trips unicode through the persisted JSON payload", () => {
    const { result } = renderNormalised();
    const unicodeTitle = "Frågor & Antworten - 你好 🎤";

    act(() => {
      result.current.setTitle(unicodeTitle);
    });

    const persisted = readPersisted() as { state: { title: string } };
    expect(persisted.state.title).toBe(unicodeTitle);
  });

  it("does not persist the action functions, only the serialisable state", () => {
    const { result } = renderNormalised();

    act(() => {
      result.current.setTitle("anything");
    });

    const persisted = readPersisted() as { state: Record<string, unknown> };
    expect(Object.keys(persisted.state).sort()).toEqual(["footer", "title"]);
  });
});
