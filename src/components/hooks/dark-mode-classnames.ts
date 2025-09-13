import { useDarkMode } from "@/stores";

export const useDarkModeClassName = (): "dark" | "light" => {
  const isDarkMode = useDarkMode();
  return isDarkMode ? "dark" : "light";
};
