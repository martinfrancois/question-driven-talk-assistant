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
    if (textareaRef?.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaRef]);

  return { adjustHeight } as const;
}
