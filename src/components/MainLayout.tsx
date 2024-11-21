import { FC, useCallback } from "react";
import { Question } from "./QuestionItem.tsx";
import { Header } from "./Header.tsx";
import { MainContent } from "./MainContent.tsx";
import { Footer } from "./Footer.tsx";
import { FullScreenQrCode } from "./FullScreenQrCode.tsx";

interface MainLayoutProps {
  title: string;
  setTitle: (title: string) => void;
  footer: string;
  setFooter: (footer: string) => void;
  timeFormat24h: boolean;
  setTimeFormat24h: (format: boolean) => void;
  questions: Question[];
  updateQuestions: (updateFunc: (draft: Question[]) => void) => void;
  qrCodeURL: string;
  setQrCodeURL: (url: string) => void;
  qrCodeSize: number;
  setQrCodeSize: (size: number) => void;
  isDarkMode: boolean;
  showFullScreenQr: boolean;
  setShowFullScreenQr: (show: boolean) => void;
}

const MainLayout: FC<MainLayoutProps> = ({
  title,
  setTitle,
  footer,
  setFooter,
  timeFormat24h,
  setTimeFormat24h,
  questions,
  updateQuestions,
  qrCodeURL,
  setQrCodeURL,
  qrCodeSize,
  setQrCodeSize,
  isDarkMode,
  showFullScreenQr,
  setShowFullScreenQr,
}) => {
  const editTitle = useCallback(() => {
    const newTitle = prompt("Edit Title", title);
    if (newTitle !== null) setTitle(newTitle);
  }, [setTitle, title]);

  const toggleTimeFormat = useCallback(
    () => setTimeFormat24h(!timeFormat24h),
    [setTimeFormat24h, timeFormat24h],
  );

  const editFooter = useCallback(() => {
    const newFooter = prompt("Edit Footer", footer);
    if (newFooter !== null) setFooter(newFooter);
  }, [footer, setFooter]);

  const hideFullScreenQrCode = useCallback(
    () => setShowFullScreenQr(false),
    [setShowFullScreenQr],
  );

  return (
    <div
      className={`flex h-screen w-screen flex-col p-4 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } ${isDarkMode ? "dark" : "light"}`}
      data-testid="main-layout-container"
    >
      <Header
        onClick={editTitle}
        title={title}
        format24h={timeFormat24h}
        toggleFormat={toggleTimeFormat}
      />
      <MainContent
        questions={questions}
        updateQuestions={updateQuestions}
        qrCodeURL={qrCodeURL}
        setQrCodeURL={setQrCodeURL}
        qrCodeSize={qrCodeSize}
        setQrCodeSize={setQrCodeSize}
      />
      <Footer onClick={editFooter} footer={footer} />
      {showFullScreenQr && qrCodeURL && (
        <FullScreenQrCode onClick={hideFullScreenQrCode} value={qrCodeURL} />
      )}
    </div>
  );
};

export default MainLayout;
