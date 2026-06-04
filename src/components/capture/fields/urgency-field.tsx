import type { CapturedTaskUrgency } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["next", "Next", "e", "🔥"],
  ["few-hours", "Few hours", "r", "⏱"],
  ["today", "Today anytime", "t", "📅"],
] as const satisfies readonly [CapturedTaskUrgency, string, string, string][];

type Props = {
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
  isInputFocused: () => boolean;
  enabled: boolean;
};

export const UrgencyField = ({ onNext, onPrev, isLast, isInputFocused, enabled }: Props) => {
  const field = useFieldContext<CapturedTaskUrgency>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskUrgency)}
      onNext={onNext}
      onPrev={onPrev}
      enabled={enabled}
      isLast={isLast}
      isInputFocused={isInputFocused}
    />
  );
};
