import { FC, useEffect, useState } from "react";
import { useTimeFormat24h, useToggleTimeFormat } from "@/stores";

const formatTime = (time: Date, timeFormat24h: boolean): string =>
  time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !timeFormat24h,
  });

const TimeDisplay: FC = () => {
  const timeFormat24h = useTimeFormat24h();
  const toggleTimeFormat = useToggleTimeFormat();

  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    // Update time every minute: it's not very accurate, but good enough for a talk
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = formatTime(time, timeFormat24h);

  return (
    <button
      onClick={toggleTimeFormat}
      className="cursor-pointer pr-2 text-right text-sm opacity-70 hover:opacity-100"
      data-testid="time-display"
      data-time-format={timeFormat24h ? "24h" : "12h"}
      aria-label={"Time: " + formattedTime}
    >
      {formattedTime}
    </button>
  );
};

export default TimeDisplay;
