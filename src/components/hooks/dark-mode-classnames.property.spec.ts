import { describe, it, expect, vi } from "vitest";

vi.mock("@/stores", () => {
  return { useDarkMode: vi.fn(() => true) };
});

describe("useDarkModeClassName", () => {
  it("maps store boolean to class name", async () => {
    const Stores = await import("@/stores");
    const { useDarkModeClassName } = await import("./dark-mode-classnames.ts");

    (Stores.useDarkMode as unknown as jest.Mock).mockReturnValue(true);
    expect(useDarkModeClassName()).toBe("dark");

    (Stores.useDarkMode as unknown as jest.Mock).mockReturnValue(false);
    expect(useDarkModeClassName()).toBe("light");
  });
});
