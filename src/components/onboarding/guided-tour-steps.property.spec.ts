import { describe, it, expect } from "vitest";
import { steps } from "./guided-tour-steps.ts";

describe("guided-tour-steps", () => {
  it("exports a non-empty array of steps with targets", () => {
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    for (const s of steps) {
      expect(typeof s.target).toBe("string");
    }
  });
});
