import { FC } from "react";
import { Header } from "./Header.tsx";
import { MainContent } from "./MainContent.tsx";
import { Footer } from "./Footer.tsx";
import { SkipLink } from "@/components/ui/SkipLink.tsx";

const MainLayout: FC = () => (
  <div
    className={`flex h-screen w-screen flex-col p-4`}
    data-testid="main-layout-container"
  >
    <SkipLink href="#question-text-0" shortcut="Control+Shift+E" />
    <Header />
    <MainContent />
    <Footer />
  </div>
);

export default MainLayout;
