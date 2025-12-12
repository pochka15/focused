import { useUiStore } from "@/domain/stores/ui-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  formatTime,
  parseTimeString,
} from "@/components/focus-panel/focus-panel-utils";
import { Input } from "@/components/ui/input";

export const Timeline = () => {
  const getMinutesLeft = useUiStore((s) => s.getMinutesLeft);
  const breakTime = useUiStore((s) => s.breakTime);
  const setBreakTime = useUiStore((s) => s.setBreakTime);
  const [editingTime, setEditingTime] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState<number>(getMinutesLeft());
  const isUrgent = minutesLeft < 10;

  const handleTimeSave = (value: string) => {
    const mins = parseTimeString(value);
    if (mins > 0) {
      // Set break time to current time + minutes
      const breakTime = new Date();
      breakTime.setMinutes(breakTime.getMinutes() + mins);
      setBreakTime(breakTime);
    } else {
      // Clear break time if 0 or invalid
      setBreakTime(null);
    }
    setMinutesLeft(mins);

    setEditingTime(false);
  };

  // Update minutesLeft when breakTime changes
  useEffect(() => {
    setMinutesLeft(getMinutesLeft());
  }, [breakTime, getMinutesLeft]);

  // Periodic update of time left (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft(getMinutesLeft());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getMinutesLeft]);

  // Update time left when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, update time left
        setMinutesLeft(getMinutesLeft());
      }
    };

    const handleFocus = () => {
      // Window gained focus, update time left
      setMinutesLeft(getMinutesLeft());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [getMinutesLeft]);

  return (
    <div className="mb-2">
      <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn(
            "bg-primary h-1 rounded-full",
            isUrgent && "bg-red-500"
          )}
          style={{ width: `${Math.min(100, (minutesLeft / 60) * 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-xs">Time left</div>
        <div className="flex items-center gap-2">
          {editingTime ? (
            <Input
              autoFocus
              onBlur={(e) => handleTimeSave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  handleTimeSave((e.target as HTMLInputElement).value);
                if (e.key === "Escape") setEditingTime(false);
              }}
              defaultValue={formatTime(minutesLeft)}
            />
          ) : (
            <button
              className="text-muted-foreground text-sm hover:underline"
              onClick={() => setEditingTime(true)}
            >
              {formatTime(minutesLeft)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
