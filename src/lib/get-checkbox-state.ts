import type { Question } from "@/stores";

export const getCheckboxState = (question: Question): string => {
  const { answered, highlighted } = question;
  // A question of only spaces has no text to announce.
  const text = question.text.trim() ? question.text : null;

  const constructMessage = (action: string, content: string | null): string => {
    return content
      ? `${action} question: ${content}`
      : `${action} empty question`;
  };

  if (answered) {
    return constructMessage("Answered", text);
  }

  if (highlighted) {
    return constructMessage("Currently answering", text);
  }

  return text ? `Question: ${text}` : "Empty Question";
};
