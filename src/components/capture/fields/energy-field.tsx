import type { CapturedTaskEnergy } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["deep", "[■■■] deep", "u", ""],
  ["normal", "[■■□] normal", "i", ""],
  ["light", "[■□□] light", "o", ""],
] as const satisfies readonly [CapturedTaskEnergy, string, string, string][];

type Props = {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
  isInputFocused: () => boolean;
  enabled: boolean;
};

export const EnergyField = ({ onNext, onPrev, isLast, isInputFocused, enabled }: Props) => {
  const field = useFieldContext<CapturedTaskEnergy>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskEnergy)}
      onNext={onNext}
      onPrev={onPrev}
      enabled={enabled}
      isLast={isLast}
      isInputFocused={isInputFocused}
    />
  );
};
