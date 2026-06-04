import type { CapturedTaskUrgency } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["next", "Next", "j", "🔥"],
  ["few-hours", "Few hours", "k", "⏱"],
  ["today", "Today anytime", "l", "📅"],
] as const satisfies readonly [CapturedTaskUrgency, string, string, string][];

export const UrgencyField = () => {
  const field = useFieldContext<CapturedTaskUrgency>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskUrgency)}
    />
  );
};
