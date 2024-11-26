import { FC } from "react";
import { Header } from "./Header.tsx";
import { MainContent } from "./MainContent.tsx";
import { Footer } from "./Footer.tsx";
import { FullScreenQrCode } from "./FullScreenQrCode.tsx";

const MainLayout: FC = () => (
  <div
    className={`flex h-screen w-screen flex-col p-4`}
    data-testid="main-layout-container"
  >
    <Header />
    <MainContent />
    <Footer />
    <FullScreenQrCode />
  </div>
);

export default MainLayout;
