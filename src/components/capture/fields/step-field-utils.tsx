import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

type OptionTuple = readonly [string, string, string, string]; // [value, label, hint, emoji]

type StepToggleProps = {
  value: string;
  options: readonly OptionTuple[];
  onPick: (value: string) => void;
};

export const StepToggle = ({ value, options, onPick }: StepToggleProps) => (
  <ToggleGroup
    type="single"
    spacing={6}
    value={value}
    onValueChange={(v) => { if (v) onPick(v); }}
  >
    {options.map(([optValue, label, hint, emoji]) => (
      <ToggleGroupItem
        key={optValue}
        value={optValue}
        aria-label={optValue}
        className="relative"
      >
        {emoji && <span>{emoji}</span>}
        <span className="font-mono">{label}</span>
        <span className={hintStyles}>{hint}</span>
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);
