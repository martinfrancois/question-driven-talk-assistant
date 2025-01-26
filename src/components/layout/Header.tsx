import { useSetTitle, useTitle } from "@/stores";
import { useCallback } from "react";
import TimeDisplay from "./TimeDisplay.tsx";
import { useHotkeys } from "react-hotkeys-hook";

export function Header() {
  const title = useTitle();
  const setTitle = useSetTitle();

  const editTitle = useCallback(() => {
    const newTitle = prompt("Edit Title", title);
    if (newTitle !== null) setTitle(newTitle);
  }, [setTitle, title]);

  useHotkeys("ctrl+shift+t", editTitle, { enableOnFormTags: true }, [
    editTitle,
  ]);

  return (
    <header className="flex shrink-0 items-center">
      <div className="grow">
        <h1
          onClick={editTitle}
          className="cursor-pointer text-3xl font-semibold"
          data-testid="main-header"
          aria-label={
            "Title text: " + (title ?? "empty") + ". Click to edit title."
          }
          tabIndex={0}
          aria-keyshortcuts="Control+Shift+T to edit title text"
        >
          {title}
        </h1>
      </div>
      <TimeDisplay />
    </header>
  );
}
