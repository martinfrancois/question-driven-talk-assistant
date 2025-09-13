import { useCallback } from "react";

export function useAutoResizeTextArea(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
) {
  /**
   * Adjusts the textarea height to fit its content.
   *
   * Set height to auto, then to scrollHeight so the textarea grows with content.
   */
  const adjustHeight = useCallback(() => {
    const el = textareaRef?.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [textareaRef]);

  return { adjustHeight } as const;
}
