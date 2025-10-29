import { useFooter, useSetFooter } from "@/stores";
import { useCallback, useMemo } from "react";
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

  const createFooterAriaLabel = useMemo(() => {
    if (footer.trim().length == 0) {
      return "Empty footer. Click to add footer.";
    } else {
      return "Footer text: " + footer + ". Click to edit footer.";
    }
  }, [footer]);

  return (
    <footer
      onClick={editFooter}
      className="min-h-11 shrink-0 cursor-pointer p-2 text-center text-xl"
      data-testid="main-footer"
      aria-label={createFooterAriaLabel}
      aria-keyshortcuts="Control+Shift+F to edit footer text"
    >
      {footer}
    </footer>
  );
}
