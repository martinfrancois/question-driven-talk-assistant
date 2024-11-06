import {FC, useRef, useEffect, RefObject, createRef} from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    KeyboardSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import QuestionItem from './QuestionItem';

interface Question {
    id: string;
    text: string;
    answered: boolean;
    highlighted: boolean;
}

interface QuestionListProps {
    questions: Question[];
    updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
}

const QuestionList: FC<QuestionListProps> = ({ questions, updateQuestions }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);

            updateQuestions((draft) => {
                return arrayMove(draft, oldIndex, newIndex);
            });
        }
    };

    // Create a ref array for each question item and update when questions change
    const questionRefs = useRef<RefObject<HTMLTextAreaElement>[]>([]);

    useEffect(() => {
        // Ensure questionRefs has a ref for each question in questions
        if (questionRefs.current.length < questions.length) {
            questionRefs.current = [
                ...questionRefs.current,
                ...Array(questions.length - questionRefs.current.length).fill(null).map(() => createRef<HTMLTextAreaElement>())
            ];
        } else if (questionRefs.current.length > questions.length) {
            questionRefs.current = questionRefs.current.slice(0, questions.length);
        }
    }, [questions.length]);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.id)} strategy={rectSortingStrategy}>
                <div className="space-y-2">
                    {questions.map((question, index) => (
                        <QuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            questions={questions}
                            questionRefs={questionRefs}
                            updateQuestions={updateQuestions}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default QuestionList;
