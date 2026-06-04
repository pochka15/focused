import type { BacklogTaskCompletion } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["final", "■  done in one go", "j", ""],
  ["splittable", "○ → ○ → ○  in rounds", "k", ""],
] as const satisfies readonly [BacklogTaskCompletion, string, string, string][];

export const CompletionField = () => {
  const field = useFieldContext<BacklogTaskCompletion>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as BacklogTaskCompletion)}
    />
  );
};
