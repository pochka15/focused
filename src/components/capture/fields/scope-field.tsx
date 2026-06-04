import type { CapturedTaskScope } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["work", "Work", "q", "💼"],
  ["personal", "Personal", "w", "🏠"],
] as const satisfies readonly [CapturedTaskScope, string, string, string][];

type Props = {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
  isInputFocused: () => boolean;
  enabled: boolean;
};

export const ScopeField = ({ onNext, onPrev, isLast, isInputFocused, enabled }: Props) => {
  const field = useFieldContext<CapturedTaskScope>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskScope)}
      onNext={onNext}
      onPrev={onPrev}
      enabled={enabled}
      isLast={isLast}
      isInputFocused={isInputFocused}
    />
  );
};
