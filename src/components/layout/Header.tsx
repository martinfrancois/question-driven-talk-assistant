import { useSetTitle, useTitle } from "@/stores";
import { useCallback, useMemo } from "react";
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

  const createTitleAriaLabel = useMemo(() => {
    if (title.trim().length == 0) {
      return "Empty title. Click to add title.";
    } else {
      return "Title text: " + title + ". Click to edit title.";
    }
  }, [title]);

  return (
    <header className="flex shrink-0 items-center">
      <div className="grow">
        <h1
          onClick={editTitle}
          className="min-h-8 cursor-pointer text-3xl font-semibold"
          data-testid="main-header"
          aria-label={createTitleAriaLabel}
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
