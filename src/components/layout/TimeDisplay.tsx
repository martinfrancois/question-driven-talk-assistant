import { FC, useEffect, useState } from "react";
import { useTimeFormat24h, useToggleTimeFormat } from "@/stores";
import { formatTime, msUntilNextMinute } from "@/lib/time.ts";

const TimeDisplay: FC = () => {
  const timeFormat24h = useTimeFormat24h();
  const toggleTimeFormat = useToggleTimeFormat();

  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    // Recompute the delay on every tick so each update lands on the minute
    // boundary, however late the previous timer fired.
    let timer: ReturnType<typeof setTimeout>;
    const tick = (): void => {
      setTime(new Date());
      timer = setTimeout(tick, msUntilNextMinute());
    };
    timer = setTimeout(tick, msUntilNextMinute());
    return (): void => {
      clearTimeout(timer);
    };
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
