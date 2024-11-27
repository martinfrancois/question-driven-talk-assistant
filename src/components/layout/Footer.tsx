import { useFooter, useSetFooter } from "../../stores";
import { useCallback } from "react";

export function Footer() {
  const footer = useFooter();
  const setFooter = useSetFooter();

  const editFooter = useCallback(() => {
    const newFooter = prompt("Edit Footer", footer);
    if (newFooter !== null) setFooter(newFooter);
  }, [footer, setFooter]);

  return (
    <footer
      onClick={editFooter}
      className="flex-shrink-0 cursor-pointer p-2 text-center text-xl"
      data-testid="main-footer"
    >
      {footer}
    </footer>
  );
}
