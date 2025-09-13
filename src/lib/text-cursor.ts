export function isMultiLineAndEmptyText(text: string): boolean {
  const lines = text.split("\n");
  return lines.length > 1 && lines.every((line) => line.trim() === "");
}

export function totalLines(text: string): number {
  return text.split("\n").length;
}

export function currentLineNumberForCursor(
  text: string,
  cursorPosition: number,
): number {
  const safePos = Math.max(0, Math.min(cursorPosition, text.length));
  const before = text.substring(0, safePos);
  let count = 0;
  for (let i = 0; i < before.length; i++) if (before[i] === "\n") count++;
  return count;
}

export function positionAtEndOfLine(text: string, lineIndex: number): number {
  const lines = text.split("\n");
  const idx = Math.max(0, Math.min(lineIndex, lines.length - 1));
  let position = 0;
  for (let i = 0; i <= idx; i++) {
    position += lines[i].length;
    if (i < idx) position += 1; // account for newline
  }
  return position;
}
