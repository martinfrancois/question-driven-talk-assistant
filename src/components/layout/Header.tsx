import { useSetTitle, useTitle } from "../../stores";
import { useCallback } from "react";
import TimeDisplay from "../TimeDisplay.tsx";

export function Header() {
  const title = useTitle();
  const setTitle = useSetTitle();

  const editTitle = useCallback(() => {
    const newTitle = prompt("Edit Title", title);
    if (newTitle !== null) setTitle(newTitle);
  }, [setTitle, title]);

  return (
    <header className="flex flex-shrink-0 items-center">
      <div className="flex-grow">
        <h1
          onClick={editTitle}
          className="cursor-pointer text-3xl font-semibold"
          data-testid="main-header"
        >
          {title}
        </h1>
      </div>
      <div className="pr-2 text-right">
        <TimeDisplay />
      </div>
    </header>
  );
}
