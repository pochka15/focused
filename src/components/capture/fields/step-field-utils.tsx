import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/random/utils";

const hintStyles =
  "text-muted-foreground absolute right-0 bottom-0 font-mono text-xs";

type SliderOptionTuple = readonly [string, string, string]; // [value, visual, label]

type StepSliderProps = {
  value: string;
  options: readonly SliderOptionTuple[];
  onPick: (value: string) => void;
};

export const StepSlider = ({ value, options, onPick }: StepSliderProps) => {
  const currentIdx = Math.max(
    0,
    options.findIndex(([v]) => v === value)
  );
  return (
    <div className="flex flex-col gap-4">
      <Slider
        min={0}
        max={options.length - 1}
        step={1}
        value={[currentIdx]}
        onValueChange={([i]) => {
          if (i !== undefined) onPick(options[i]![0]);
        }}
      />
      <div className="flex justify-between px-1">
        {options.map(([v, visual, label], i) => (
          <div
            key={v}
            className={cn(
              "flex flex-col items-center gap-0.5 font-mono text-xs transition-colors",
              i === currentIdx
                ? "text-foreground font-bold"
                : "text-muted-foreground/70"
            )}
          >
            {visual && <span>{visual}</span>}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
    onValueChange={(v) => {
      if (v) onPick(v);
    }}
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
