import React, { FC, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import QuestionItem from "./QuestionItem.tsx";
import { Props } from "@dnd-kit/core/dist/components/DndContext/DndContext";
import { Question, useQuestions, useSetQuestions } from "@/stores";

type TextareaRef = React.RefObject<HTMLTextAreaElement | null>;
type QuestionRefs = React.RefObject<Map<string, TextareaRef>>;

interface RegisteredQuestionItemProps {
  question: Question;
  questionRefs: QuestionRefs;
  registerQuestionRef: (
    questionId: string,
    textareaRef: TextareaRef | null,
  ) => void;
  index: number;
}

const RegisteredQuestionItem: FC<RegisteredQuestionItemProps> = ({
  question,
  questionRefs,
  registerQuestionRef,
  index,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    registerQuestionRef(question.id, textareaRef);
    return (): void => {
      registerQuestionRef(question.id, null);
    };
  }, [question.id, registerQuestionRef]);

  return (
    <QuestionItem
      question={question}
      questionRefs={questionRefs}
      textareaRef={textareaRef}
      index={index}
    />
  );
};

const QuestionList: FC = () => {
  const questions = useQuestions();
  const setQuestions = useSetQuestions();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd: Props["onDragEnd"] = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const questionRefs = useRef(new Map<string, TextareaRef>());

  const registerQuestionRef = useCallback(
    (questionId: string, textareaRef: TextareaRef | null): void => {
      if (textareaRef) {
        questionRefs.current.set(questionId, textareaRef);
      } else {
        questionRefs.current.delete(questionId);
      }
    },
    [],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={questions.map((q) => q.id)}
        strategy={rectSortingStrategy}
      >
        <div className="space-y-0" role="list">
          {questions.map((question, index) => (
            <RegisteredQuestionItem
              key={question.id}
              question={question}
              questionRefs={questionRefs}
              registerQuestionRef={registerQuestionRef}
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuestionList;
