import type { CapturedTaskSize } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["quick", "<30m", "a", "▪"],
  ["medium", "1-2h", "s", "▬▬"],
  ["big", "2h+", "d", "▬▬▬▬"],
] as const satisfies readonly [CapturedTaskSize, string, string, string][];

type Props = {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
  isInputFocused: () => boolean;
  enabled: boolean;
};

export const SizeField = ({ onNext, onPrev, isLast, isInputFocused, enabled }: Props) => {
  const field = useFieldContext<CapturedTaskSize>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      column
      onPick={(v) => field.handleChange(v as CapturedTaskSize)}
      onNext={onNext}
      onPrev={onPrev}
      enabled={enabled}
      isLast={isLast}
      isInputFocused={isInputFocused}
    />
  );
};
