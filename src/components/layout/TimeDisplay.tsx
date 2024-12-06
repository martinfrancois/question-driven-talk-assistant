import { FC, useState, useEffect, useCallback } from "react";
import { useTimeFormat24h, useToggleTimeFormat } from "@/stores";

const TimeDisplay: FC = () => {
  const timeFormat24h = useTimeFormat24h();
  const toggleTimeFormat = useToggleTimeFormat();

  const [time, setTime] = useState("");

  const updateTime = useCallback(() => {
    const now = new Date();
    setTime(
      timeFormat24h
        ? now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
    );
  }, [timeFormat24h]);

  useEffect(() => {
    updateTime();
    // Update time every minute: it's not very accurate, but good enough for a talk
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [timeFormat24h, updateTime]);

  return (
    <button
      onClick={toggleTimeFormat}
      className="cursor-pointer pr-2 text-right text-sm opacity-70 hover:opacity-100"
      data-testid="time-display"
      aria-label={"Time: " + time}
    >
      {time}
    </button>
  );
};

export default TimeDisplay;
