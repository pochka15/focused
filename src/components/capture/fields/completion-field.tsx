import type { CapturedTaskCompletion } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["final", "■  done in one go", "z", ""],
  ["splittable", "○ → ○ → ○  in rounds", "x", ""],
] as const satisfies readonly [CapturedTaskCompletion, string, string, string][];

type Props = {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
  isInputFocused: () => boolean;
  enabled: boolean;
};

export const CompletionField = ({ onNext, onPrev, isLast, isInputFocused, enabled }: Props) => {
  const field = useFieldContext<CapturedTaskCompletion>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskCompletion)}
      onNext={onNext}
      onPrev={onPrev}
      enabled={enabled}
      isLast={isLast}
      isInputFocused={isInputFocused}
    />
  );
};
