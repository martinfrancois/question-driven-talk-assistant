export const MIN_QR_CODE_SIZE = 32;
export const MAX_QR_CODE_SIZE = 256;

export function clampQrSize(size: number): number {
  const min = MIN_QR_CODE_SIZE;
  const max = MAX_QR_CODE_SIZE;
  const bounded = Math.max(size, min);
  return Math.min(bounded, max);
}

export type ResizeDirection = "bottom-right" | "bottom-left";

export function computeResizeDelta(
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
): number {
  return direction === "bottom-right"
    ? Math.max(deltaX, deltaY)
    : Math.max(-deltaX, deltaY);
}
