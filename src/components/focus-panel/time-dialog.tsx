import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useUiStore } from "@/domain/stores/ui-store";
import { dropRight, head, nth } from "lodash";
import { useState, type FC } from "react";

const maybeInt = (x?: string) => {
  if (!x) return undefined;
  try {
    return Number(x);
  } catch {
    return undefined;
  }
};

const parse = (value: string) => {
  const s = value.trim();
  if (s.endsWith("p")) {
    const s1 = s.slice(0, s.length - 1);
    const minutes = maybeInt(s1) ?? 0;
    return minutes * 30;
  }

  // case Yh Xm
  if (s.includes("h") || s.includes("m")) {
    const parts = s.split(" ");
    let totalMinutes = 0;
    for (const part of parts) {
      if (part.endsWith("h")) {
        const hoursPart = dropRight(part.split("h"), 1).join("h");
        const hours = maybeInt(hoursPart) ?? 0;
        totalMinutes += hours * 60;
      } else if (part.endsWith("m")) {
        const minutesPart = dropRight(part.split("m"), 1).join("m");
        const minutes = maybeInt(minutesPart) ?? 0;
        totalMinutes += minutes;
      }
    }
    return totalMinutes;
  }

  // case at ...
  if (s.startsWith("at ")) {
    const timePart = s.slice(3).trim();
    const now = new Date();
    const parts = timePart.split(":");
    const hours = maybeInt(head(parts)) ?? 0;
    const minutes = maybeInt(nth(parts, 1)) ?? 0;
    const targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );
    let diff = (targetTime.getTime() - now.getTime()) / (1000 * 60);
    if (diff < 0) {
      // If time has already passed today, set for tomorrow
      diff += 24 * 60;
    }
    return Math.floor(diff);
  }

  return maybeInt(s) ?? 0;
};

export const TimeDialog: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const setBreakTime = useUiStore((s) => s.setBreakTime);
  const getMinutesLeft = useUiStore((s) => s.getMinutesLeft);
  const [rawValue, setRawValue] = useState(`${getMinutesLeft()}m`);
  const [minutes, setMinutes] = useState(getMinutesLeft());

  const submit = () => {
    const now = new Date();
    const breakTime = new Date(now.getTime() + minutes * 60 * 1000);
    setBreakTime(breakTime);
    onClose();
  };

  const setAll = (src: number, n: number, s: string) => {
    const parsed = src === 0 ? parse(s) : n;
    setMinutes(parsed);
    setRawValue(s);
  };

  const handleRawValueChange = (v: string) => setAll(0, parse(v), v);

  const handleMinutesChange = (x: number | undefined) => {
    if (x) setAll(1, x, `${x}m`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set time</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          value={rawValue}
          onChange={(e) => handleRawValueChange(e.target.value)}
          className="mb-2"
        />
        <Slider
          value={[minutes]}
          max={120}
          step={1}
          onValueChange={(arr) => handleMinutesChange(arr[0])}
        />
      </DialogContent>
    </Dialog>
  );
};
