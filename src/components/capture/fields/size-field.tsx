import type { CapturedTaskSize } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepSlider } from "./step-field-utils";

const options = [
  ["quick", "▪", "<30m"],
  ["medium", "▬▬", "1-2h"],
  ["big", "▬▬▬▬", "2h+"],
] as const satisfies readonly [CapturedTaskSize, string, string][];

export const SizeField = () => {
  const field = useFieldContext<CapturedTaskSize>();
  return (
    <StepSlider
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskSize)}
    />
  );
};
