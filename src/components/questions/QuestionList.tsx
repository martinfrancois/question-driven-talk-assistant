import React, { FC, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import QuestionItem from "./QuestionItem.tsx";
import { Props } from "@dnd-kit/core/dist/components/DndContext/DndContext";
import { useQuestions, useSetQuestions } from "@/stores";
import { reorderQuestionsByIds } from "@/lib/questions-utils.ts";

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
    const activeId = String(active.id);
    const overId = over?.id == null ? over?.id : String(over.id);
    const reordered = reorderQuestionsByIds(questions, activeId, overId);
    if (reordered !== questions) setQuestions(reordered);
  };

  // Use a mapping from question ID to ref, creating refs only once
  const questionRefs = useRef<
    Record<string, React.RefObject<HTMLTextAreaElement | null>>
  >({});

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
          {questions.map((question, index) => {
            // Create a ref for each question if it doesn't exist
            if (!questionRefs.current[question.id]) {
              questionRefs.current[question.id] =
                React.createRef<HTMLTextAreaElement>();
            }
            return (
              <QuestionItem
                key={question.id}
                question={question}
                questionRefs={questionRefs}
                textareaRef={questionRefs.current[question.id]}
                index={index}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default QuestionList;
