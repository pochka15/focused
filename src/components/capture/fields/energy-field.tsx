import type { CapturedTaskEnergy } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepSlider } from "./step-field-utils";

const options = [
  ["deep", "[■■■]", "deep"],
  ["normal", "[■■□]", "normal"],
  ["light", "[■□□]", "light"],
] as const satisfies readonly [CapturedTaskEnergy, string, string][];

export const EnergyField = () => {
  const field = useFieldContext<CapturedTaskEnergy>();
  return (
    <StepSlider
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskEnergy)}
    />
  );
};
