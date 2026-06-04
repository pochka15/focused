import type { CapturedTaskEnergy } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["deep", "[■■■] deep", "j", ""],
  ["normal", "[■■□] normal", "k", ""],
  ["light", "[■□□] light", "l", ""],
] as const satisfies readonly [CapturedTaskEnergy, string, string, string][];

export const EnergyField = () => {
  const field = useFieldContext<CapturedTaskEnergy>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskEnergy)}
    />
  );
};
