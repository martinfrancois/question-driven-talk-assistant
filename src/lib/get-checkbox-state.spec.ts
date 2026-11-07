import { describe, it, expect } from "vitest";
import { getCheckboxState } from "./get-checkbox-state.ts";
import type { Question } from "@/stores";

const question = (over: Partial<Question>): Question => ({
  id: "q",
  text: "",
  answered: false,
  highlighted: false,
  ...over,
});

describe("getCheckboxState with whitespace-only text", () => {
  it("announces a question with only spaces as empty", () => {
    expect(getCheckboxState(question({ text: "   " }))).toBe("Empty Question");
  });

  it("announces an answered question with only spaces as empty", () => {
    expect(getCheckboxState(question({ text: "  ", answered: true }))).toBe(
      "Answered empty question",
    );
  });
});
