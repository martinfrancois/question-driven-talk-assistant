/* eslint-disable @typescript-eslint/no-unsafe-call -- act is recognized as `any` which is incorrect */
import { beforeEach, describe, expect, it, vi, test } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useQuestions,
  useSetQuestions,
  useMoveQuestionUp,
  useMoveQuestionDown,
  useUpdateQuestionText,
  useRemoveQuestion,
  useInsertQuestion,
  useAddQuestion,
  useClickCheckbox,
  useClearQuestions,
} from "./questions";
import { StorageName } from "./storage-names.ts";

describe("setQuestions", () => {
  test.each([
    {
      description: "setting multiple questions",
      newQuestions: [
        {
          id: "1",
          text: "First question",
          answered: false,
          highlighted: false,
        },
        {
          id: "2",
          text: "Second question",
          answered: true,
          highlighted: true,
        },
      ],
      expectedLength: 2,
    },
    {
      description: "setting an empty array",
      newQuestions: [],
      expectedLength: 0,
    },
  ])("$description", ({ newQuestions, expectedLength }) => {
    const { result } = renderHook(() => ({
      setQuestions: useSetQuestions(),
      questions: useQuestions(),
    }));

    act((): void => {
      result.current.setQuestions(newQuestions);
    });

    expect(result.current.questions).toEqual(newQuestions);
    expect(result.current.questions).toHaveLength(expectedLength);
  });
});

describe("useQuestionsStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("setQuestions", () => {
    test.each([
      {
        description: "setting multiple questions",
        newQuestions: [
          {
            id: "1",
            text: "First question",
            answered: false,
            highlighted: false,
          },
          {
            id: "2",
            text: "Second question",
            answered: true,
            highlighted: true,
          },
        ],
        expectedLength: 2,
      },
      {
        description: "setting an empty array",
        newQuestions: [],
        expectedLength: 0,
      },
    ])("$description", ({ newQuestions, expectedLength }) => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        questions: useQuestions(),
      }));

      // Act: set new questions
      act(() => {
        result.current.setQuestions(newQuestions);
      });

      // Assert
      expect(result.current.questions).toEqual(newQuestions);
      expect(result.current.questions).toHaveLength(expectedLength);
    });
  });

  describe("moveQuestionUp", () => {
    test.each([
      {
        description: "moving a question up with two questions",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
        index: 1,
        expectedQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
      {
        description:
          "moving a question up with three questions, moving second up",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 1,
        expectedQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
      },
      {
        description:
          "moving a question up with three questions, moving third up",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 2,
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
    ])("$description", ({ initialQuestions, index, expectedQuestions }) => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        moveQuestionUp: useMoveQuestionUp(),
        questions: useQuestions(),
        clearQuestions: useClearQuestions(),
      }));

      // Act: set initial questions
      act(() => {
        result.current.setQuestions(initialQuestions);
      });

      // Act: move question up
      act(() => {
        result.current.moveQuestionUp(index);
      });

      // Assert
      expect(result.current.questions).toEqual(expectedQuestions);
    });
  });

  describe("moveQuestionDown", () => {
    test.each([
      {
        description: "moving a question down with two questions",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
        index: 0,
        expectedQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
      {
        description:
          "moving a question down with three questions, moving first down",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 0,
        expectedQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
      },
      {
        description:
          "moving a question down with three questions, moving second down",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 1,
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
    ])("$description", ({ initialQuestions, index, expectedQuestions }) => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        moveQuestionDown: useMoveQuestionDown(),
        questions: useQuestions(),
      }));

      // Act: set initial questions
      act(() => {
        result.current.setQuestions(initialQuestions);
      });

      // Act: move question down
      act(() => {
        result.current.moveQuestionDown(index);
      });

      // Assert
      expect(result.current.questions).toEqual(expectedQuestions);
    });
  });

  describe("updateQuestionText", () => {
    test.each([
      {
        description: "updating text of existing question",
        initialQuestions: [
          { id: "1", text: "Old Text", answered: false, highlighted: false },
        ],
        id: "1",
        newText: "New Text",
        expectedQuestions: [
          { id: "1", text: "New Text", answered: false, highlighted: false },
        ],
      },
      {
        description: "updating text of non-existent question",
        initialQuestions: [
          { id: "1", text: "Old Text", answered: false, highlighted: false },
        ],
        id: "2",
        newText: "Should not update",
        expectedQuestions: [
          { id: "1", text: "Old Text", answered: false, highlighted: false },
        ],
      },
    ])(
      "$description",
      ({ initialQuestions, id, newText, expectedQuestions }) => {
        const { result } = renderHook(() => ({
          setQuestions: useSetQuestions(),
          updateQuestionText: useUpdateQuestionText(),
          questions: useQuestions(),
        }));

        // Act: set initial questions
        act(() => {
          result.current.setQuestions(initialQuestions);
        });

        // Act: update question text
        act(() => {
          result.current.updateQuestionText(id, newText);
        });

        // Assert
        expect(result.current.questions).toEqual(expectedQuestions);
      },
    );
  });

  describe("insertQuestion", () => {
    test.each([
      {
        description: "inserting question at the middle index",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 1,
        newQuestion: {
          id: "2",
          text: "Q2",
          answered: false,
          highlighted: false,
        },
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
      },
      {
        description: "inserting question at the beginning",
        initialQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
        index: 0,
        newQuestion: {
          id: "1",
          text: "Q1",
          answered: false,
          highlighted: false,
        },
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
      {
        description: "inserting question at the end",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
        index: 1,
        newQuestion: {
          id: "2",
          text: "Q2",
          answered: false,
          highlighted: false,
        },
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
    ])(
      "$description",
      ({ initialQuestions, index, newQuestion, expectedQuestions }) => {
        const { result } = renderHook(() => ({
          setQuestions: useSetQuestions(),
          insertQuestion: useInsertQuestion(),
          questions: useQuestions(),
        }));

        // Act: set initial questions
        act(() => {
          result.current.setQuestions(initialQuestions);
        });

        // Act: insert new question
        act(() => {
          result.current.insertQuestion(index, newQuestion);
        });

        // Assert
        expect(result.current.questions).toEqual(expectedQuestions);
      },
    );
  });

  describe("addQuestion", () => {
    test.each([
      {
        description: "adding question to a non-empty list",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
        newQuestion: {
          id: "2",
          text: "Q2",
          answered: false,
          highlighted: false,
        },
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
      {
        description: "adding question to an empty list",
        initialQuestions: [],
        newQuestion: {
          id: "1",
          text: "Q1",
          answered: false,
          highlighted: false,
        },
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
    ])(
      "$description",
      ({ initialQuestions, newQuestion, expectedQuestions }) => {
        const { result } = renderHook(() => ({
          setQuestions: useSetQuestions(),
          addQuestion: useAddQuestion(),
          questions: useQuestions(),
        }));

        // Act: set initial questions
        act(() => {
          result.current.setQuestions(initialQuestions);
        });

        // Act: add new question
        act(() => {
          result.current.addQuestion(newQuestion);
        });

        // Assert
        expect(result.current.questions).toEqual(expectedQuestions);
      },
    );
  });

  describe("removeQuestion", () => {
    test.each([
      {
        description: "removing question with a valid index",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
        index: 0,
        expectedQuestions: [
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
      {
        description: "removing question with an invalid index",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
        index: 5,
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
      {
        description: "removing the last question correctly",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
          { id: "3", text: "Q3", answered: false, highlighted: false },
        ],
        index: 2,
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ],
      },
    ])("$description", ({ initialQuestions, index, expectedQuestions }) => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        removeQuestion: useRemoveQuestion(),
        questions: useQuestions(),
      }));

      // Act: set initial questions
      act(() => {
        result.current.setQuestions(initialQuestions);
      });

      // Act: remove question
      act(() => {
        result.current.removeQuestion(index);
      });

      // Assert
      expect(result.current.questions).toEqual(expectedQuestions);
    });
  });

  describe("clickCheckbox", () => {
    test.each([
      {
        description: "first click should highlight the question",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
        id: "1",
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: true },
        ],
      },
      {
        description:
          "second click should mark as answered and remove highlight",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: true },
        ],
        id: "1",
        expectedQuestions: [
          { id: "1", text: "Q1", answered: true, highlighted: false },
        ],
      },
      {
        description: "clicking an answered question should uncheck it",
        initialQuestions: [
          { id: "1", text: "Q1", answered: true, highlighted: false },
        ],
        id: "1",
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
      {
        description: "clicking a non-existent question should do nothing",
        initialQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
        id: "2",
        expectedQuestions: [
          { id: "1", text: "Q1", answered: false, highlighted: false },
        ],
      },
    ])("$description", ({ initialQuestions, id, expectedQuestions }) => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        clickCheckbox: useClickCheckbox(),
        questions: useQuestions(),
      }));

      // Act: set initial questions
      act(() => {
        result.current.setQuestions(initialQuestions);
      });

      // Act: click checkbox
      act(() => {
        result.current.clickCheckbox(id);
      });

      // Assert
      expect(result.current.questions).toEqual(expectedQuestions);
    });

    it("should handle multiple questions correctly", () => {
      const q1 = { id: "1", text: "Q1", answered: false, highlighted: false };
      const q2 = { id: "2", text: "Q2", answered: false, highlighted: false };
      const initialQuestions = [q1, q2];

      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        clickCheckbox: useClickCheckbox(),
        questions: useQuestions(),
      }));

      // Act: set initial questions
      act(() => {
        result.current.setQuestions(initialQuestions);
      });

      // Act: Click q1 to highlight
      act(() => {
        result.current.clickCheckbox("1");
      });

      // Assert after first click
      expect(result.current.questions).toEqual([
        { ...q1, highlighted: true },
        q2,
      ]);

      // Act: Click q1 again to mark as answered
      act(() => {
        result.current.clickCheckbox("1");
      });

      // Assert after second click
      expect(result.current.questions).toEqual([
        { ...q1, answered: true, highlighted: false },
        q2,
      ]);

      // Act: Click q2 to highlight
      act(() => {
        result.current.clickCheckbox("2");
      });

      // Assert after third click
      expect(result.current.questions).toEqual([
        { ...q1, answered: true, highlighted: false },
        { ...q2, highlighted: true },
      ]);

      // Act: Click q2 again to mark as answered
      act(() => {
        result.current.clickCheckbox("2");
      });

      // Assert after fourth click
      expect(result.current.questions).toEqual([
        { ...q1, answered: true, highlighted: false },
        { ...q2, answered: true, highlighted: false },
      ]);
    });
  });

  describe("clearQuestions", () => {
    it("should clear questions to initial state", () => {
      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        clearQuestions: useClearQuestions(),
        questions: useQuestions(),
      }));

      // Act: set questions
      act(() => {
        result.current.setQuestions([
          { id: "1", text: "Q1", answered: false, highlighted: false },
          { id: "2", text: "Q2", answered: false, highlighted: false },
        ]);
      });

      // Act: clear questions
      act(() => {
        result.current.clearQuestions();
      });

      // Assert
      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0]).toMatchObject({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        text: "",
        answered: false,
        highlighted: false,
      });
    });
  });

  describe("persist middleware", () => {
    it("should persist state to localStorage when state changes", () => {
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

      const { result } = renderHook(() => ({
        setQuestions: useSetQuestions(),
        questions: useQuestions(),
      }));

      // Define questions to set
      const q1 = { id: "1", text: "Q1", answered: false, highlighted: false };
      const q2 = {
        id: "2",
        text: "Persisted question",
        answered: true,
        highlighted: false,
      };

      // Act: set questions which should trigger persistence
      act(() => {
        result.current.setQuestions([q1, q2]);
      });

      // Assert that setItem was called with the correct arguments
      expect(setItemSpy).toHaveBeenCalledWith(
        StorageName.QUESTIONS, // Correct storage key
        JSON.stringify({
          state: {
            questions: [q1, q2],
          },
          version: 0,
        }), // Correct persisted structure
      );
    });
  });
});
