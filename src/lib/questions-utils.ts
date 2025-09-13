import { arrayMove } from "@dnd-kit/sortable";
import type { Question } from "@/stores/questions.ts";

export function reorderQuestionsByIds(
  questions: Question[],
  activeId: string,
  overId: string | null | undefined,
): Question[] {
  if (!overId || activeId === overId) return questions;
  const oldIndex = questions.findIndex((q) => q.id === activeId);
  const newIndex = questions.findIndex((q) => q.id === overId);
  if (oldIndex === -1 || newIndex === -1) return questions;
  return arrayMove(questions, oldIndex, newIndex);
}
