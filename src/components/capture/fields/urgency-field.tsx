import type { CapturedTaskUrgency } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepSlider } from "./step-field-utils";

const options = [
  ["next", "🔥", "Next"],
  ["few-hours", "⏱", "Can wait few hours"],
  ["today", "📅", "Today"],
] as const satisfies readonly [CapturedTaskUrgency, string, string][];

export const UrgencyField = () => {
  const field = useFieldContext<CapturedTaskUrgency>();
  return (
    <StepSlider
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskUrgency)}
    />
  );
};
