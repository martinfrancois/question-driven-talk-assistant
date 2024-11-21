import { Question } from "./QuestionItem.tsx";
import QuestionList from "./QuestionList.tsx";
import QrCodeComponent from "./QrCodeComponent.tsx";

export function MainContent(props: {
  questions: Question[];
  updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
  qrCodeURL: string;
  setQrCodeURL: (url: string) => void;
  qrCodeSize: number;
  setQrCodeSize: (size: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-1 overflow-hidden">
      <div className="scrollbar-minimal max-h-full flex-grow overflow-y-auto pr-2">
        <QuestionList
          questions={props.questions}
          updateQuestions={props.updateQuestions}
        />
      </div>

      <div className="ml-4 flex-shrink-0 self-start">
        <QrCodeComponent
          qrCodeURL={props.qrCodeURL}
          setQrCodeURL={props.setQrCodeURL}
          qrCodeSize={props.qrCodeSize}
          setQrCodeSize={props.setQrCodeSize}
        />
      </div>
    </div>
  );
}
