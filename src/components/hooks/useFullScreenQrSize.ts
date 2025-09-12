import { useState, useEffect } from "react";

const FULLSCREEN_QR_SCALE = 0.7;

export function useFullScreenQrSize(): number {
  const getSize = () =>
    Math.min(window.innerHeight, window.innerWidth) * FULLSCREEN_QR_SCALE;

  const [size, setSize] = useState<number>(getSize());

  useEffect(() => {
    const handleResize = () => setSize(getSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
