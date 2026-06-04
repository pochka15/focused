import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CompletionField } from "./fields/completion-field";
import { EnergyField } from "./fields/energy-field";
import { ScopeField } from "./fields/scope-field";
import { SizeField } from "./fields/size-field";
import { UrgencyField } from "./fields/urgency-field";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    ScopeField,
    UrgencyField,
    SizeField,
    EnergyField,
    CompletionField,
  },
  formComponents: {},
});
