import TimeDisplay from "./TimeDisplay.tsx";
import { useSetTitle, useTitle } from "../stores";
import { useCallback } from "react";

export function Header() {
  const title = useTitle();
  const setTitle = useSetTitle();

  const editTitle = useCallback(() => {
    const newTitle = prompt("Edit Title", title);
    if (newTitle !== null) setTitle(newTitle);
  }, [setTitle, title]);

  return (
    <div className="flex flex-shrink-0 items-center">
      <div className="flex-grow">
        <div
          onClick={editTitle}
          className="cursor-pointer text-3xl font-semibold"
          data-testid="main-header"
        >
          {title}
        </div>
      </div>
      <div className="pr-2 text-right">
        <TimeDisplay />
      </div>
    </div>
  );
}
