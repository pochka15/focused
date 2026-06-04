import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/random/utils";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

type OptionTuple = readonly [string, string, string, string]; // [value, label, hint, emoji]

type StepToggleProps = {
  value: string;
  options: readonly OptionTuple[];
  column?: boolean;
  enabled: boolean;
  onPick: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isInputFocused: () => boolean;
  isLast: boolean;
};

export const StepToggle = ({
  value,
  options,
  column,
  enabled,
  onPick,
  onNext,
  onPrev,
  isInputFocused,
  isLast,
}: StepToggleProps) => {
  useShortcuts({
    name: "structuredTaskStep",
    enabled,
    keys: (key) => {
      if (isInputFocused()) return true;
      if (key === "n") { onNext(); return true; }
      if (key === "p") { onPrev(); return true; }
      const match = options.find(([, , hint]) => hint === key);
      if (match) {
        onPick(match[0]);
        if (!isLast) onNext();
        return true;
      }
      return false;
    },
  });

  return (
    <ToggleGroup
      type="single"
      spacing={2}
      value={value}
      className={cn(column && "flex-col items-start")}
      onValueChange={(v) => {
        if (!v) return;
        onPick(v);
        if (!isLast) onNext();
      }}
    >
      {options.map(([optValue, label, hint, emoji]) => (
        <ToggleGroupItem
          key={optValue}
          value={optValue}
          aria-label={optValue}
          className={cn("relative", column && "w-full justify-start")}
        >
          {emoji && <span>{emoji}</span>}
          <span className="font-mono">{label}</span>
          <span className={hintStyles}>{hint}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
