import type { BacklogTaskUrgency } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepSlider } from "./step-field-utils";

const options = [
  ["next", "🔥", "Next"],
  ["few-hours", "⏱", "Can wait few hours"],
  ["today", "📅", "Today"],
] as const satisfies readonly [BacklogTaskUrgency, string, string][];

export const UrgencyField = () => {
  const field = useFieldContext<BacklogTaskUrgency>();
  return (
    <StepSlider
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as BacklogTaskUrgency)}
    />
  );
};
