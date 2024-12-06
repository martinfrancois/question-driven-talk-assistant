import { useDarkMode } from "@/stores";

export const useDarkModeClassName = () => {
  const isDarkMode = useDarkMode();
  return isDarkMode ? "dark" : "light";
};
