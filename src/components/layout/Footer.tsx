import { useFooter, useSetFooter } from "@/stores";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export function Footer() {
  const footer = useFooter();
  const setFooter = useSetFooter();

  const editFooter = useCallback(() => {
    const newFooter = prompt("Edit Footer", footer);
    if (newFooter !== null) setFooter(newFooter);
  }, [footer, setFooter]);

  useHotkeys("ctrl+shift+f", editFooter, { enableOnFormTags: true }, [
    editFooter,
  ]);

  return (
    <footer
      onClick={editFooter}
      className="flex-shrink-0 cursor-pointer p-2 text-center text-xl"
      data-testid="main-footer"
      aria-label={
        "Footer text: " + (footer ?? "empty") + ". Click to edit footer."
      }
      aria-keyshortcuts="Control+Shift+F to edit footer text"
    >
      {footer}
    </footer>
  );
}
