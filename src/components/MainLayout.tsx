import { FC } from "react";
import { Header } from "./Header.tsx";
import { MainContent } from "./MainContent.tsx";
import { Footer } from "./Footer.tsx";
import { FullScreenQrCode } from "./FullScreenQrCode.tsx";
import { useDarkMode } from "../stores";

const MainLayout: FC = () => {
  const isDarkMode = useDarkMode();

  return (
    <div
      className={`flex h-screen w-screen flex-col p-4 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black" // TODO can be moved to App?
      } ${isDarkMode ? "dark" : "light"}`} // TODO necessary?
      data-testid="main-layout-container"
    >
      <Header />
      <MainContent />
      <Footer />
      <FullScreenQrCode />
    </div>
  );
};

export default MainLayout;
