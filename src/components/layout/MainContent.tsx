import QuestionList from "../questions/QuestionList.tsx";

import QrCodeComponent from "../qr/QrCodeComponent.tsx";

export function MainContent() {
  return (
    <div className="mt-4 flex flex-1 overflow-hidden">
      <main className="scrollbar-minimal max-h-full flex-grow overflow-y-auto pr-2">
        <QuestionList />
      </main>
      <aside className="ml-4 flex-shrink-0 self-start">
        <QrCodeComponent />
      </aside>
    </div>
  );
}
