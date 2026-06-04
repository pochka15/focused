import type { CapturedTaskSize } from "@/lib/stores/capture-store";
import { useFieldContext } from "../structured-task-form-context";
import { StepToggle } from "./step-field-utils";

const options = [
  ["quick", "<30m", "j", "▪"],
  ["medium", "1-2h", "k", "▬▬"],
  ["big", "2h+", "l", "▬▬▬▬"],
] as const satisfies readonly [CapturedTaskSize, string, string, string][];

export const SizeField = () => {
  const field = useFieldContext<CapturedTaskSize>();
  return (
    <StepToggle
      value={field.state.value}
      options={options}
      onPick={(v) => field.handleChange(v as CapturedTaskSize)}
    />
  );
};
