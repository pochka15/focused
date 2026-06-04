import type { BacklogTaskScope } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["work", "Work", "j", "💼"],
  ["personal", "Personal", "k", "🏠"],
] as const satisfies readonly [BacklogTaskScope, string, string, string][];

export const ScopeField = () => {
  const field = useFieldContext<BacklogTaskScope>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as BacklogTaskScope)}
    />
  );
};
