import {FC, useState, useEffect, useCallback} from 'react';

interface TimeDisplayProps {
    format24h: boolean;
    toggleFormat: () => void;
}

const TimeDisplay: FC<TimeDisplayProps> = ({ format24h, toggleFormat }) => {
    const [time, setTime] = useState('');

    const updateTime = useCallback(() => {
        const now = new Date();
        setTime(
            format24h
                ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        );
    }, [format24h]);

    useEffect(() => {
        updateTime();
        const interval = setInterval(updateTime, 60000); // Update time every minute
        return () => clearInterval(interval);
    }, [format24h, updateTime]);

    return (
        <div
            onClick={toggleFormat}
            className="cursor-pointer text-sm text-center opacity-70 hover:opacity-100"
            data-testid="time-display"
        >
            {time}
        </div>
    );
};

export default TimeDisplay;
