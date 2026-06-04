import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/random/utils";
import {
  useCaptureStore,
  type BacklogTask,
  type BacklogTaskCompletion,
  type BacklogTaskEnergy,
  type BacklogTaskScope,
  type BacklogTaskSize,
  type BacklogTaskUrgency,
} from "@/lib/stores/capture-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import type { ModeName } from "@/lib/shortcuts/shortcuts-modes";
import type { KnownShortcutsListener } from "@/shared-lib/shortcuts/shortcuts-glue";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAppForm } from "./structured-task-form-context";

const schema = z.object({
  name: z.string().min(1),
  description: z.string(),
  scope: z.enum(["work", "personal"]),
  urgency: z.enum(["next", "few-hours", "today"]),
  size: z.enum(["quick", "medium", "big"]),
  energy: z.enum(["deep", "normal", "light"]),
  completion: z.enum(["final", "splittable"]),
});

type FormValues = {
  name: string;
  description: string;
  scope: BacklogTaskScope;
  urgency: BacklogTaskUrgency;
  size: BacklogTaskSize;
  energy: BacklogTaskEnergy;
  completion: BacklogTaskCompletion;
};

const blankValues: FormValues = {
  name: "",
  description: "",
  scope: "work",
  urgency: "next",
  size: "medium",
  energy: "deep",
  completion: "final",
};

const taskToFormValues = (t: BacklogTask): FormValues => ({
  name: t.name,
  description: t.description,
  scope: t.scope,
  urgency: t.urgency,
  size: t.size,
  energy: t.energy,
  completion: t.completion,
});

const PICK_KEYS = ["j", "k", "l"] as const;

type Step = {
  field: "scope" | "urgency" | "size" | "energy" | "completion";
  label: string;
  values: readonly string[];
};

const STEPS: readonly Step[] = [
  { field: "scope", label: "Scope", values: ["work", "personal"] },
  {
    field: "urgency",
    label: "Urgency",
    values: ["next", "few-hours", "today"],
  },
  { field: "size", label: "Size", values: ["quick", "medium", "big"] },
  { field: "energy", label: "Energy", values: ["deep", "normal", "light"] },
  { field: "completion", label: "Completion", values: ["final", "splittable"] },
] as const;

type ShortcutNames = {
  form: KnownShortcutsListener;
  step: KnownShortcutsListener;
  disableOnDone: ModeName[];
};

const DEFAULT_SHORTCUT_NAMES: ShortcutNames = {
  form: "structuredTask",
  step: "structuredTaskStep",
  disableOnDone: ["structuredTask"],
};

type Props = {
  editedTask?: BacklogTask;
  onDone?: () => void;
  shortcutNames?: ShortcutNames;
};

export const StructuredTaskForm = ({
  editedTask,
  onDone,
  shortcutNames = DEFAULT_SHORTCUT_NAMES,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const inputsCounter = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);

  const consumeNextId = useCaptureStore((s) => s.consumeNextId);
  const addTask = usePlanningStore((s) => s.addTask);
  const updateTask = usePlanningStore((s) => s.updateTask);

  const { enabled } = useShortcutsMode(shortcutNames.form as ModeName);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const isInputFocused = () =>
    document.activeElement === nameInputRef.current ||
    document.activeElement === descriptionInputRef.current;

  const form = useAppForm({
    defaultValues: editedTask ? taskToFormValues(editedTask) : blankValues,
    validators: { onChange: schema },
    onSubmit: ({ value }) => {
      if (editedTask) {
        updateTask({ ...value, id: editedTask.id });
      } else {
        const id = consumeNextId();
        addTask({ ...value, id });
      }
      form.reset();
      setCurrentStep(0);
      disableModes(shortcutNames.disableOnDone);
      onDone?.();
    },
  });

  // Re-sync form when editedTask changes (different task selected for editing)
  useEffect(() => {
    form.reset();
  }, [editedTask?.id]);

  const { disableModes } = useShortcuts({
    name: shortcutNames.form,
    enabled,
    keys: (key, event) => {
      if (key === "Escape") {
        disableModes(shortcutNames.disableOnDone);
        onDone?.();
        return true;
      }

      const direction = key === "ctrl+n" ? 1 : key === "ctrl+p" ? -1 : 0;
      if (direction) {
        const inputs = Array.from(
          formRef.current?.querySelectorAll('input[data-focusable="true"]') ||
            []
        ) as HTMLInputElement[];
        inputsCounter.current += direction;
        inputs[inputsCounter.current % inputs.length]?.focus();
        event.preventDefault();
        return true;
      }

      if (key === "Enter") {
        event.preventDefault();
        form.handleSubmit();
        return true;
      }
      return true;
    },
  });

  const step = STEPS[currentStep]!;

  useShortcuts({
    name: shortcutNames.step,
    enabled,
    keys: (key) => {
      if (isInputFocused()) return false;
      if (key === "n") {
        goNext();
        return true;
      }
      if (key === "p") {
        goPrev();
        return true;
      }
      const pickIdx = PICK_KEYS.indexOf(key as (typeof PICK_KEYS)[number]);
      if (pickIdx !== -1 && pickIdx < step.values.length) {
        form.setFieldValue(step.field, step.values[pickIdx] as never);
        if (currentStep < STEPS.length - 1) goNext();
        return true;
      }
      return false;
    },
  });

  return (
    <form
      ref={formRef}
      className={cn("flex flex-col gap-4", !enabled && "hidden")}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <div className="flex">
        <form.AppField
          name="name"
          children={(field) => (
            <Input
              data-focusable="true"
              autoComplete="off"
              ref={nameInputRef}
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="Task name"
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        />
        <Button variant="ghost" type="submit" size="sm" className="shrink-0">
          {editedTask ? "Save" : "Add"}
        </Button>
      </div>

      <form.AppField
        name="description"
        children={(field) => (
          <Input
            data-focusable="true"
            autoComplete="off"
            ref={descriptionInputRef}
            id={field.name}
            name={field.name}
            value={field.state.value}
            placeholder="Description (optional)"
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />

      {/* Step navigator */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-xs">
            {currentStep + 1}/{STEPS.length} · {step.label}
          </span>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === currentStep ? "bg-foreground" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        <form.AppField name="scope">
          {(field) => (
            <div className={cn(step.field !== "scope" && "hidden")}>
              <field.ScopeField />
            </div>
          )}
        </form.AppField>

        <form.AppField name="urgency">
          {(field) => (
            <div className={cn(step.field !== "urgency" && "hidden")}>
              <field.UrgencyField />
            </div>
          )}
        </form.AppField>

        <form.AppField name="size">
          {(field) => (
            <div className={cn(step.field !== "size" && "hidden")}>
              <field.SizeField />
            </div>
          )}
        </form.AppField>

        <form.AppField name="energy">
          {(field) => (
            <div className={cn(step.field !== "energy" && "hidden")}>
              <field.EnergyField />
            </div>
          )}
        </form.AppField>

        <form.AppField name="completion">
          {(field) => (
            <div className={cn(step.field !== "completion" && "hidden")}>
              <field.CompletionField />
            </div>
          )}
        </form.AppField>

        <div className="text-muted-foreground flex justify-between font-mono text-xs">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="opacity-50 hover:opacity-100 disabled:pointer-events-none disabled:opacity-20"
          >
            ← p
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentStep === STEPS.length - 1}
            className="opacity-50 hover:opacity-100 disabled:pointer-events-none disabled:opacity-20"
          >
            n →
          </button>
        </div>
      </div>
    </form>
  );
};
