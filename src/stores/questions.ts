import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

export interface Question {
  id: string;
  text: string;
  answered: boolean;
  highlighted: boolean;
}

interface QuestionsState {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  moveQuestionUp: (index: number) => void;
  moveQuestionDown: (index: number) => void;
  updateQuestionText: (id: string, text: string) => void;
  insertQuestion: (index: number, question: Question) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (index: number) => void;
  clickCheckbox: (id: string) => void;
  clearQuestions: () => void;
}

export const createEmptyQuestion = () => ({
  id: Date.now().toString(),
  text: "",
  answered: false,
  highlighted: false,
});

function initialQuestions() {
  return [createEmptyQuestion()];
}

const useQuestionsStore = create<QuestionsState>()(
  devtools(
    persist(
      immer((set) => ({
        questions: initialQuestions(),
        setQuestions: (questions) =>
          set((state) => {
            state.questions = questions;
          }),
        moveQuestionUp: (index) =>
          set((state) => {
            const temp = state.questions[index];
            state.questions[index] = state.questions[index - 1];
            state.questions[index - 1] = temp;
          }),
        moveQuestionDown: (index) =>
          set((state) => {
            const temp = state.questions[index];
            state.questions[index] = state.questions[index + 1];
            state.questions[index + 1] = temp;
          }),
        updateQuestionText: (id, text) =>
          set((state) => {
            const index = state.questions.findIndex((q) => q.id === id);
            if (index != -1) {
              const question = state.questions[index];
              question.text = text;
            }
          }),
        removeQuestion: (index) =>
          set((state) => {
            state.questions.splice(index, 1);
          }),
        insertQuestion: (index, question) =>
          set((state) => {
            state.questions.splice(index, 0, question);
          }),
        addQuestion: (question) =>
          set((state) => {
            state.questions.push(question);
          }),
        clickCheckbox: (id) =>
          set((state) => {
            const idx = state.questions.findIndex((q) => q.id === id);
            if (idx !== -1) {
              const question = state.questions[idx];
              if (question.answered) {
                // If already answered, just uncheck it
                question.answered = false;
              } else if (!question.highlighted) {
                // First click: highlight the question
                question.highlighted = true;
              } else {
                // Second click when highlighted: mark as answered and remove highlight
                question.answered = true;
                question.highlighted = false;
              }
            }
          }),
        clearQuestions: () =>
          set((state) => {
            state.questions = initialQuestions();
          }),
      })),
      {
        name: StorageName.QUESTIONS,
      },
    ),
    { name: "Questions Store" },
  ),
);

export const useQuestions = () => useQuestionsStore((state) => state.questions);
export const useSetQuestions = () =>
  useQuestionsStore((state) => state.setQuestions);
export const useMoveQuestionUp = () =>
  useQuestionsStore((state) => state.moveQuestionUp);
export const useMoveQuestionDown = () =>
  useQuestionsStore((state) => state.moveQuestionDown);
export const useUpdateQuestionText = () =>
  useQuestionsStore((state) => state.updateQuestionText);
export const useRemoveQuestion = () =>
  useQuestionsStore((state) => state.removeQuestion);
export const useInsertQuestion = () =>
  useQuestionsStore((state) => state.insertQuestion);
export const useAddQuestion = () =>
  useQuestionsStore((state) => state.addQuestion);
export const useClickCheckbox = () =>
  useQuestionsStore((state) => state.clickCheckbox);
export const useClearQuestions = () =>
  useQuestionsStore((state) => state.clearQuestions);
