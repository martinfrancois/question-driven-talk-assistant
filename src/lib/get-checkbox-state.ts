import type { Question } from "@/stores";

export const getCheckboxState = (question: Question): string => {
  const { answered, highlighted, text } = question;

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

export default getCheckboxState;
